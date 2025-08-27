import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { ensurePath } from "@/core/fs/paths";
import { ConsoleLogger } from "@/core/logging/logger";
import { saveJson } from "@/core/serialization/json";
import { parseXlsx } from "@/core/serialization/xlsx";
import { fetchWithRetry } from "@/core/utils/fetch";
import type { AdministrativeRecord } from "@/shared/geo/types";

import type { AdministrativeDataAdapter } from "./types";

/**
 * Enhanced ISTAT adapter with XLSX support and temporal versioning.
 */
export class ISTATAdapter implements AdministrativeDataAdapter {
  readonly name = "istat-italy";
  readonly logger = ConsoleLogger.getInstance();

  constructor(private readonly basePath: string) {}

  getRawDataPath(): string {
    return join(this.basePath, "istat", "italy-communes-raw.xlsx");
  }

  getDataPath(): string {
    return join(this.basePath, "istat", "italy-communes.json");
  }

  async fetch(): Promise<string> {
    const url =
      "https://www.istat.it/wp-content/uploads/2024/09/Elenco-comuni-italiani.xlsx";

    const response = await fetchWithRetry(url, undefined, {
      retryCondition: (res) => !res.ok && res.status !== 404,
    });
    const xlsxBuffer: ArrayBuffer = await response.arrayBuffer();
    await this.saveRawXLSX(xlsxBuffer);

    // to get the fetched raw data without fetching again
    // const xlsxBuffer = await readFile(this.getRawDataPath());

    try {
      const standardized = await this.parseISTATXlsx(xlsxBuffer);

      const content = JSON.stringify(
        {
          metadata: {
            source: "istat",
            fetchedAt: new Date().toISOString(),
            recordCount: standardized.length,
            sourceVersion: this.extractVersionFromData(standardized),
          },
          data: standardized,
        },
        null,
        2,
      );
      await this.saveToFile(content);
      return content;
    } catch (error: unknown) {
      this.logger.error(
        `Error parsing ISTAT XLSX: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private async parseISTATXlsx(
    xlsxBuffer: ArrayBuffer,
  ): Promise<AdministrativeRecord[]> {
    const worksheets = await parseXlsx(xlsxBuffer);

    const targetWorksheet = worksheets[0];

    if (!targetWorksheet) {
      throw new Error("No valid worksheet found in XLSX file");
    }

    const sourceVersion = this.extractVersionFromSheetName(
      targetWorksheet.name,
    );

    return this.transformRowsToRecords(targetWorksheet.rows, sourceVersion);
  }

  private extractVersionFromSheetName(sheetName: string): string {
    const match = sheetName.match(/(\d{2})_(\d{2})_(\d{4})/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split("T")[0] as string;
  }

  private extractVersionFromData(records: AdministrativeRecord[]): string {
    const firstRecord = records[0];
    if (firstRecord?.metadata?.sheetVersion) {
      return firstRecord.metadata.sheetVersion as string;
    }

    return new Date().toISOString().split("T")[0] as string;
  }

  private transformRowsToRecords(
    rawData: unknown[][],
    sourceVersion: string,
  ): AdministrativeRecord[] {
    const records: AdministrativeRecord[] = [];
    const regionsMap = new Map<string, string>();
    const provincesMap = new Map<string, string>();

    if (rawData.length < 2) {
      throw new Error("Invalid XLSX format: no data rows found");
    }

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    for (const row of dataRows) {
      const rowObj = this.createRowObject(headers, row as unknown[]);

      // field mappings for 2025 ISTAT format

      const nuts1 = this.getFieldValue(rowObj, [
        "Codice NUTS1 2024",
        "Codice NUTS1 2021",
      ]);
      const nuts2 = this.getFieldValue(rowObj, [
        "Codice NUTS2 2024 (3)",
        "Codice NUTS2 2021 (3)",
      ]);
      const nuts3 = this.getFieldValue(rowObj, [
        "Codice NUTS3 2024",
        "Codice NUTS3 2021",
      ]);

      // AREA
      const areaCode = this.getFieldValue(rowObj, [
        "Codice Ripartizione Geografica",
      ]);

      const areaName = this.getFieldValue(rowObj, ["Ripartizione geografica"]);

      // REGION
      const regionName = this.getFieldValue(rowObj, ["Denominazione Regione"]);
      const regionCode = this.getFieldValue(rowObj, ["Codice Regione"]);

      // PROVINCE
      const provinceCode = this.getFieldValue(rowObj, [
        "Codice Provincia (Storico)(1)",
      ]);
      const provinceName = this.getFieldValue(rowObj, [
        "Denominazione dell'Unità territoriale sovracomunale \n(valida a fini statistici)",
        "Denominazione dell'Unità territoriale sovracomunale (valida a fini statistici)",
      ]);

      const territorialType = this.getFieldValue(rowObj, [
        "Tipologia di Unità territoriale sovracomunale",
      ]);
      const abbreviation = this.getFieldValue(rowObj, [
        "Sigla automobilistica",
      ]);

      // COMMUNE
      const communeName = this.getFieldValue(rowObj, [
        "Denominazione in italiano",
      ]);
      const communeAltName = this.getFieldValue(rowObj, [
        "Denominazione altra lingua",
      ]);
      const communeAlphaCode = this.getFieldValue(rowObj, [
        "Codice Comune formato alfanumerico",
      ]);

      const cadastralCode = this.getFieldValue(rowObj, [
        "Codice Catastale del comune",
      ]);

      const isCapital =
        this.getFieldValue(rowObj, [
          "Flag Comune capoluogo di provincia/città metropolitana/libero consorzio",
        ]) === "1";

      const baseMetadata = {
        source: "istat",
        sourceVersion,
        nuts1,
        nuts2,
      };

      // Add region if not seen before
      if (!regionsMap.has(regionCode)) {
        regionsMap.set(regionCode, regionName);
        records.push({
          code: regionCode,
          name: regionName,
          level: 1,
          countryCode: "IT",
          metadata: {
            ...baseMetadata,
            type: "region",
            areaCode,
            areaName,
          },
        });
      }

      // Add province if not seen before
      if (provinceCode && !provincesMap.has(provinceCode)) {
        provincesMap.set(provinceCode, provinceName);
        records.push({
          code: provinceCode,
          name: provinceName,
          level: 2,
          parentCode: regionCode,
          countryCode: "IT",
          metadata: {
            ...baseMetadata,
            type: "province",
            nuts3,
            abbreviation,
            territorialType,
          },
        });
      }

      // Add commune
      records.push({
        code: communeAlphaCode,
        name: communeName,
        level: 3,
        parentCode: provinceCode,
        countryCode: "IT",
        metadata: {
          ...baseMetadata,
          type: "commune",
          nuts3,
          communeAltName,
          cadastralCode,
          isCapital: String(isCapital),
        },
      });
    }

    this.logger.info(
      `Parsed ${records.length} administrative records from version ${sourceVersion}`,
    );
    return records;
  }

  // Helper to create row object from headers and values
  private createRowObject(
    headers: string[],
    values: unknown[],
  ): Record<string, string> {
    const obj: Record<string, string> = {};

    for (let i = 0; i < headers.length && i < values.length; i++) {
      const header = headers[i];
      const value = values[i];

      if (header && value !== null && value !== undefined) {
        obj[header] = String(value).trim();
      }
    }

    return obj;
  }

  // Flexible field value extraction with fallbacks
  private getFieldValue(
    row: Record<string, string>,
    fieldNames: string[],
  ): string {
    for (const fieldName of fieldNames) {
      if (row[fieldName]) {
        return row[fieldName].trim();
      }

      // Case-insensitive fallback
      const normalizedFieldName = fieldName
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .trim();

      const matchingKey = Object.keys(row).find((key) => {
        const normalizedKey = key
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .toLowerCase()
          .trim();
        return normalizedKey === normalizedFieldName;
      });

      if (matchingKey && row[matchingKey]) {
        return row[matchingKey].trim();
      }
    }

    return "";
  }

  private async saveRawXLSX(xlsxArrayBuffer: ArrayBuffer): Promise<void> {
    const xlsxPath = this.getRawDataPath();

    await ensurePath(dirname(xlsxPath));

    const xlsxBuffer = Buffer.from(xlsxArrayBuffer);
    await writeFile(xlsxPath, xlsxBuffer);

    this.logger.info(`Saved raw XLSX to: ${xlsxPath}`);
  }

  private async saveToFile(content: string): Promise<void> {
    const filePath = this.getDataPath();
    await saveJson(JSON.parse(content), filePath, {
      overwrite: true,
      createFolders: true,
    });
  }
}
