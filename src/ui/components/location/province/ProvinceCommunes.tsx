import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

import type { ProvinceWithCommunes } from "@/domain/models/location/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import type { LinkPropsType } from "@/ui/components/layout/types";

interface ProvinceCommunesProps {
  province: ProvinceWithCommunes;
  communeCallback: (provinceCode: string) => LinkPropsType;
}

export const ProvinceCommunes = ({
  province,
  communeCallback,
}: ProvinceCommunesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communes Directory</CardTitle>
        <CardDescription>
          Municipal communes within {province.name} province
        </CardDescription>
      </CardHeader>
      <CardContent>
        {province.communes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {province.communes.map((commune) => (
              <Link key={commune.code} {...communeCallback(commune.code)}>
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{commune.name}</div>
                    {commune.isCapital && (
                      <Shield className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    {commune.code}
                  </div>
                  {commune.cadastralCode && (
                    <div className="text-xs text-muted-foreground">
                      Cadastral: {commune.cadastralCode}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No communes data available for this province.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
