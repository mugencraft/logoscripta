import {
  ISTAT_TERRITORIAL_TYPE_NAMES,
  type ProvinceWithCommunes,
} from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { Label } from "@/ui/components/core/label";

interface ProvinceInformationProps {
  province: ProvinceWithCommunes;
}

export const ProvinceInformation = ({ province }: ProvinceInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrative Details</CardTitle>
        <CardDescription>
          Official codes and synchronization information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Province Code
              </Label>
              <p className="font-mono text-lg">{province.code}</p>
            </div>

            {province.abbreviation && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Abbreviation
                </Label>
                <p className="font-mono text-lg">{province.abbreviation}</p>
              </div>
            )}

            {province.territorialType && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Territorial Type
                </Label>
                <p className="font-mono text-lg">
                  {ISTAT_TERRITORIAL_TYPE_NAMES[province.territorialType]}
                </p>
              </div>
            )}

            {province.nuts1Code && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  NUTS1 Code
                </Label>
                <p className="font-mono">{province.nuts1Code}</p>
              </div>
            )}
            {province.nuts2Code && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  NUTS2 Code
                </Label>
                <p className="font-mono">{province.nuts2Code}</p>
              </div>
            )}
            {province.nuts3Code && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  NUTS3 Code
                </Label>
                <p className="font-mono">{province.nuts3Code}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Data Source
              </Label>
              <p>
                <Badge variant="secondary">{province.sourceId}</Badge>
              </p>
            </div>

            {province.lastSyncAt && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Synchronized
                </Label>
                <p className="text-sm">
                  {new Date(province.lastSyncAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
