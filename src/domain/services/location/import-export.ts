import type { LocationCommandsPort } from "@/domain/ports/location/commands";
import type { LocationQueriesPort } from "@/domain/ports/location/queries";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  type POIMetadata,
  poiMetadataSchema,
} from "@/domain/validation/location/poi";

export interface POIImportResult {
  poisCreated: number;
  errors: string[];
}

type POIImportOptions = {
  skipInvalid?: boolean;
};

type POIData = {
  name: string;
  type: string;
  communeCode: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  metadata?: POIMetadata;
};

export class LocationImportExportService {
  constructor(
    private readonly commands: LocationCommandsPort,
    private readonly queries: LocationQueriesPort,
  ) {}

  async importPOIs(
    poisData: POIData[],
    options: POIImportOptions = {},
  ): Promise<POIImportResult> {
    const { skipInvalid = true } = options;
    const errors: string[] = [];
    let poisCreated = 0;

    // Pre-load commune lookup
    const communes = await this.queries.getCommunesWithStats();
    const validCommuneCodes = new Set(communes.map((c) => c.code));
    const communeCodesPathMap = new Map(
      communes.map((p) => [p.code, p.codesPath]),
    );
    const communeNamesPathMap = new Map(
      communes.map((p) => [p.code, p.namesPath]),
    );

    for (const poiData of poisData) {
      try {
        if (!validCommuneCodes.has(poiData.communeCode)) {
          throw new Error(`Commune ${poiData.communeCode} not found`);
        }

        // biome-ignore lint/style/noNonNullAssertion: valid
        const parentCodesPath = communeCodesPathMap.get(poiData.communeCode!);
        // biome-ignore lint/style/noNonNullAssertion: valid
        const parentNamesPath = communeNamesPathMap.get(poiData.communeCode!);

        const createdPOI = await this.commands.createPOI({
          name: poiData.name,
          type: poiData.type,
          communeCode: poiData.communeCode,
          codesPath: `${parentCodesPath}`,
          namesPath: `${parentNamesPath}/${poiData.name}`,
          latitude: poiData.latitude,
          longitude: poiData.longitude,
          address: poiData.address,
          metadata: createMetadata(poiMetadataSchema, {
            ...poiData.metadata,
            import: {
              source: "import",
              importedAt: new Date(),
            },
          }),
        });

        await this.commands.updatePOI(createdPOI.id, {
          codesPath: `${parentCodesPath}/${createdPOI.id}`,
        });

        poisCreated++;
      } catch (error) {
        const errorMsg = `POI ${poiData.name}: ${error instanceof Error ? error.message : error}`;
        errors.push(errorMsg);
        if (!skipInvalid) throw new Error(errorMsg);
      }
    }

    return { poisCreated, errors };
  }

  async exportPOIs(communeCodes?: string[]) {
    const allPOIs = await this.queries.getPOIsWithLocation();
    const filteredPOIs = communeCodes
      ? allPOIs.filter((poi) => communeCodes.includes(poi.communeCode))
      : allPOIs;

    if (filteredPOIs.length === 0) {
      throw new Error("No POIs found for export");
    }

    return filteredPOIs.map((poi) => ({
      name: poi.name,
      type: poi.type,
      communeCode: poi.communeCode,
      latitude: poi.latitude,
      longitude: poi.longitude,
      address: poi.address,
      metadata: poi.metadata,
    }));
  }
}
