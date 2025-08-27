import { Link } from "@tanstack/react-router";
import { Flag, MapPin } from "lucide-react";

import type { Country } from "@/domain/models/location/country";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import type { LinkPropsType } from "@/ui/components/layout/types";

interface CountryOverviewProps {
  country: Country;
  link: LinkPropsType;
}

export const CountryOverview = ({ country, link }: CountryOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Region
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-medium">{country.region}</div>
          {country.subregion && (
            <p className="text-xs text-muted-foreground">{country.subregion}</p>
          )}
        </CardContent>
      </Card>

      {country.capital && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{country.capital}</div>
          </CardContent>
        </Card>
      )}

      {country.coordinates && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Coordinates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">
              {country.coordinates[0]?.toFixed(2)},{" "}
              {country.coordinates[1]?.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Administrative Regions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            to={link.to}
            search={link.search}
            className="text-2xl font-bold hover:underline text-blue-600"
          >
            View Regions
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
