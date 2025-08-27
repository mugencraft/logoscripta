import { Link } from "@tanstack/react-router";

import type { RegionWithProvinces } from "@/domain/models/location/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import type { LinkPropsType } from "@/ui/components/layout/types";

interface RegionProvincesProps {
  region: RegionWithProvinces;
  linkCallback: (provinceCode: string) => LinkPropsType;
}

export const RegionProvinces = ({
  region,
  linkCallback,
}: RegionProvincesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provinces</CardTitle>
        <CardDescription>
          Administrative provinces within {region.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {region.provinces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {region.provinces.map((province) => (
              <Link key={province.code} {...linkCallback(province.code)}>
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="font-medium">{province.name}</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {province.code}
                    {province.abbreviation && ` • ${province.abbreviation}`}
                  </div>
                  {/* {province.capital && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Capital: {province.capital}
                    </div>
                  )} */}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No provinces found for this region.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
