import { RefreshCw } from "lucide-react";
import { useState } from "react";

import type {
  CountriesSyncResult,
  ItalySyncResult,
} from "@/domain/models/location/types";

import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/ui/components/core/tabs";

import { CountriesPreviewCard } from "./CountriesPreviewCard";
import { ItalyPreviewCard } from "./ItalyPreviewCard";

interface LocationSyncProps {
  previewCountriesSync: () => Promise<CountriesSyncResult>;
  previewItalySync: () => Promise<ItalySyncResult>;
  syncCountries: () => Promise<CountriesSyncResult>;
  syncItaly: () => Promise<ItalySyncResult>;
  isCountriesLoading: boolean;
  isItalyLoading: boolean;
  countriesError?: string;
  italyError?: string;
}

export const LocationSync = ({
  previewCountriesSync,
  previewItalySync,
  syncCountries,
  syncItaly,
  countriesError,
  isCountriesLoading,
  italyError,
  isItalyLoading,
}: LocationSyncProps) => {
  const [countriesPreview, setCountriesPreview] =
    useState<CountriesSyncResult | null>(null);
  const [italyPreview, setItalyPreview] = useState<ItalySyncResult | null>(
    null,
  );
  const [currentCounts, setCurrentCounts] = useState({
    countries: 0,
    regions: 0,
  });

  const handleCountriesPreview = async () => {
    try {
      const result = await previewCountriesSync();
      setCountriesPreview(result);
      setCurrentCounts((prev) => ({ ...prev, countries: result.countries }));
    } catch (error) {
      console.error("Countries preview failed:", error);
    }
  };

  const handleItalyPreview = async () => {
    try {
      const result = await previewItalySync();
      setItalyPreview(result);
    } catch (error) {
      console.error("Italy preview failed:", error);
    }
  };

  const handleCountriesSync = async () => {
    await syncCountries();
    setCountriesPreview(null); // Clear preview after sync
  };

  const handleItalySync = async () => {
    await syncItaly();
    setItalyPreview(null); // Clear preview after sync
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Data Synchronization
        </CardTitle>
        <CardDescription>
          Sync administrative data from official sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="countries" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="italy">Italy Administrative</TabsTrigger>
          </TabsList>

          <TabsContent value="countries" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Button onClick={handleCountriesPreview} variant="outline">
                Preview Changes
              </Button>
            </div>

            {countriesPreview?.preview && (
              <CountriesPreviewCard
                title="Countries Preview"
                description="Changes to be applied to countries database"
                currentCount={currentCounts.countries}
                stats={countriesPreview.preview}
                onSync={handleCountriesSync}
                isLoading={isCountriesLoading}
                error={countriesError}
              />
            )}
          </TabsContent>

          <TabsContent value="italy" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Button onClick={handleItalyPreview} variant="outline">
                Preview Changes
              </Button>
            </div>

            {italyPreview?.preview && (
              <ItalyPreviewCard
                stats={italyPreview.preview}
                onSync={handleItalySync}
                isLoading={isItalyLoading}
                error={italyError}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
