import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";

interface XlsxWorksheet {
  name: string;
  rows: unknown[][];
}

// biome-ignore lint/suspicious/noExplicitAny: check
type RawXlsxWorksheets = Map<string, any>;

type SheetDefinition = { name: string; sheetId: string };

/**
 * Handles the XLSX format as a ZIP archive containing XML files.
 */
export class XlsxParser {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "_text",
    });
  }

  async parseFromBuffer(buffer: ArrayBuffer): Promise<XlsxWorksheet[]> {
    const zip = await JSZip.loadAsync(buffer);

    const [workbook, sharedStrings, worksheets] = await Promise.all([
      this.extractWorkbook(zip),
      this.extractSharedStrings(zip),
      this.extractWorksheets(zip),
    ]);

    return this.processWorksheets(workbook, worksheets, sharedStrings);
  }

  // biome-ignore lint/suspicious/noExplicitAny: check
  private async extractWorkbook(zip: JSZip): Promise<any> {
    const workbookFile = zip.file("xl/workbook.xml");
    if (!workbookFile) {
      throw new Error("Invalid XLSX: missing workbook.xml");
    }

    const workbookXml = await workbookFile.async("text");
    return this.xmlParser.parse(workbookXml);
  }

  private async extractSharedStrings(zip: JSZip): Promise<string[]> {
    const sharedStringsFile = zip.file("xl/sharedStrings.xml");
    if (!sharedStringsFile) return [];

    const sharedStringsXml = await sharedStringsFile.async("text");
    const parsed = this.xmlParser.parse(sharedStringsXml);

    const sst = parsed.sst;
    if (!sst || !sst.si) return [];

    const items = Array.isArray(sst.si) ? sst.si : [sst.si];

    // biome-ignore lint/suspicious/noExplicitAny: check
    return items.map((item: any) => {
      if (item.t === "") return "";

      let extractedValue = "";
      if (item.t) {
        if (typeof item.t === "string") {
          extractedValue = item.t;
        } else if (item.t._text !== undefined) {
          extractedValue = item.t._text;
        } else {
          extractedValue = String(item.t);
        }
      } else if (item.r) {
        const parts = Array.isArray(item.r) ? item.r : [item.r];
        // biome-ignore lint/suspicious/noExplicitAny: check
        extractedValue = parts.map((part: any) => part.t || "").join("");
      }

      return extractedValue;
    });
  }

  private async extractWorksheets(zip: JSZip): Promise<RawXlsxWorksheets> {
    // biome-ignore lint/suspicious/noExplicitAny: check
    const worksheets = new Map<string, any>();

    const worksheetFiles = Object.keys(zip.files).filter(
      (name) => name.startsWith("xl/worksheets/") && name.endsWith(".xml"),
    );

    for (const fileName of worksheetFiles) {
      const file = zip.file(fileName);
      if (file) {
        const xml = await file.async("text");
        const parsed = this.xmlParser.parse(xml);

        const sheetName = fileName
          .replace("xl/worksheets/", "")
          .replace(".xml", "");
        worksheets.set(sheetName, parsed);
      }
    }

    return worksheets;
  }

  private processWorksheets(
    // biome-ignore lint/suspicious/noExplicitAny: check
    workbook: any,
    worksheets: RawXlsxWorksheets,
    sharedStrings: string[],
  ): XlsxWorksheet[] {
    const result: XlsxWorksheet[] = [];

    const sheets = this.extractSheetDefinitions(workbook);

    for (const sheet of sheets) {
      const worksheetData = worksheets.get(sheet.sheetId);
      if (!worksheetData) continue;

      const rows = this.processWorksheetRows(worksheetData, sharedStrings);
      result.push({
        name: sheet.name,
        rows,
      });
    }

    return result;
  }

  private extractSheetDefinitions(
    // biome-ignore lint/suspicious/noExplicitAny: check
    workbook: any,
  ): SheetDefinition[] {
    const sheets = workbook?.workbook?.sheets?.sheet;
    if (!sheets) return [];

    const sheetArray = Array.isArray(sheets) ? sheets : [sheets];

    // biome-ignore lint/suspicious/noExplicitAny: check
    return sheetArray.map((sheet: any) => ({
      name: sheet["@_name"] || "Sheet1",
      sheetId: `sheet${sheet["@_sheetId"] || "1"}`,
    }));
  }

  private processWorksheetRows(
    // biome-ignore lint/suspicious/noExplicitAny: check
    worksheet: any,
    sharedStrings: string[],
  ): unknown[][] {
    const sheetData = worksheet?.worksheet?.sheetData;
    if (!sheetData || !sheetData.row) return [];

    const rows = Array.isArray(sheetData.row) ? sheetData.row : [sheetData.row];
    const processedRows: unknown[][] = [];

    for (const row of rows) {
      const rowIndex = parseInt(row["@_r"] || "1", 10) - 1;
      const cells = Array.isArray(row.c) ? row.c : row.c ? [row.c] : [];

      // Ensure we have enough rows
      while (processedRows.length <= rowIndex) {
        processedRows.push([]);
      }

      for (const cell of cells) {
        const cellRef = cell["@_r"] || "A1";
        const colIndex = this.columnToNumber(cellRef.replace(/\d+$/, ""));
        const value = this.extractCellValue(cell, sharedStrings);

        // Ensure we have enough columns
        // biome-ignore lint/style/noNonNullAssertion: check
        while (processedRows[rowIndex]!.length <= colIndex) {
          // biome-ignore lint/style/noNonNullAssertion: check
          processedRows[rowIndex]!.push("");
        }

        // biome-ignore lint/style/noNonNullAssertion: check
        processedRows[rowIndex]![colIndex] = value;
      }
    }

    return processedRows;
  }

  // biome-ignore lint/suspicious/noExplicitAny: check
  private extractCellValue(cell: any, sharedStrings: string[]): unknown {
    const cellType = cell["@_t"];
    const value = cell.v;

    switch (cellType) {
      // String
      case "str":
        return String(value);
      // Shared string
      case "s": {
        const stringIndex = parseInt(String(value), 10);
        return sharedStrings[stringIndex] || "";
      }
      // Inline string
      case "inlineStr":
        return cell.is?.t || "";
      // Boolean
      case "b":
        return value === "1";
      // Number or Date
      default: {
        const numValue = parseFloat(value);
        return Number.isNaN(numValue) ? value : numValue;
      }
    }
  }

  /**
   * Convert Excel column letter to number (A=0, B=1, etc.)
   */
  private columnToNumber(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + (column.charCodeAt(i) - 65 + 1);
    }
    return result - 1;
  }
}

/**
 * Factory function for easier usage
 */
export const parseXlsx = async (
  buffer: ArrayBuffer,
): Promise<XlsxWorksheet[]> => {
  const parser = new XlsxParser();
  return parser.parseFromBuffer(buffer);
};
