import { Link } from "@tanstack/react-router";

import type { RegionWithProvinces } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { Label } from "@/ui/components/core/label";
import type { LinkPropsType } from "@/ui/components/layout/types";

interface RegionDetailsProps {
  region: RegionWithProvinces;
  link: LinkPropsType;
}

export const RegionDetails = ({ region, link }: RegionDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Information</CardTitle>
        <CardDescription>
          Administrative codes and synchronization information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Region Code
              </Label>
              <p className="font-mono">{region.code}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Country
              </Label>
              <p>
                <Link
                  to={link.to}
                  params={link.params}
                  className="text-blue-600 hover:underline"
                >
                  {region.countryCode}
                </Link>
              </p>
            </div>
            {region.nuts1Code && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  NUTS1 Code
                </Label>
                <p className="font-mono">{region.nuts1Code}</p>
              </div>
            )}
            {region.nuts2Code && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  NUTS2 Code
                </Label>
                <p className="font-mono">{region.nuts2Code}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Data Source
              </Label>
              <p>
                <Badge variant="secondary">{region.sourceId}</Badge>
              </p>
            </div>
            {region.lastSyncAt && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Synchronized
                </Label>
                <p>{new Date(region.lastSyncAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
