import { Clock, Globe } from "lucide-react";

import type { Country } from "@/domain/models/location/country";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { Label } from "@/ui/components/core/label";

interface CountryInformationProps {
  country: Country;
}

export const CountryInformation = ({ country }: CountryInformationProps) => {
  const formatCurrency = () => {
    if (!country.currencies) return null;
    return Object.entries(country.currencies).map(([code, currency]) => ({
      code,
      name: currency.name,
      symbol: currency.symbol,
    }));
  };

  const formatLanguages = () => {
    if (!country.languages) return null;
    return Object.entries(country.languages);
  };

  const currencies = formatCurrency();
  const languages = formatLanguages();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Country Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                ISO Code
              </Label>
              <p className="font-mono text-lg">{country.code}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Official Name
              </Label>
              <p className="font-medium">{country.officialName}</p>
            </div>
          </div>

          {/* Languages section */}
          {languages && languages.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Languages
              </Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {languages.map(([code, name]) => (
                  <Badge key={code} variant="outline" className="text-xs">
                    {name} ({code.toUpperCase()})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Currencies section */}
          {currencies && currencies.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Currencies
              </Label>
              <div className="space-y-1 mt-1">
                {currencies.map((currency) => (
                  <div key={currency.code} className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {currency.code}
                    </Badge>
                    <span className="text-sm">
                      {currency.name} ({currency.symbol})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Administrative Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timezone information */}
          {country.timezones && country.timezones.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Timezones
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {country.timezones.map((timezone) => (
                  <Badge
                    key={timezone}
                    variant="outline"
                    className="text-xs font-mono"
                  >
                    {timezone}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sync tracking information */}
          {country.lastSyncAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Data Synchronization
              </Label>
              <div className="space-y-2 mt-1">
                <div className="text-sm">
                  <span className="font-medium">Last Updated:</span>{" "}
                  {new Date(country.lastSyncAt).toLocaleString()}
                </div>
                <Badge variant="secondary" className="text-xs">
                  Source: Official REST Countries API
                </Badge>
              </div>
            </div>
          )}

          {/* Geographic coordinates with map link */}
          {country.coordinates && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Geographic Center
              </Label>
              <div className="space-y-2 mt-1">
                <div className="font-mono text-sm">
                  Lat: {country.coordinates[0]}, Lng: {country.coordinates[1]}
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${country.coordinates[0]}&mlon=${country.coordinates[1]}&zoom=5`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View on OpenStreetMap
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
