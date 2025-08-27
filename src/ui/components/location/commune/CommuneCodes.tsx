import { Hash } from "lucide-react";

import type { Commune } from "@/domain/models/location/commune";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { Label } from "@/ui/components/core/label";

interface CommuneCodesProps {
  commune: Commune;
}

export const CommuneCodes = ({ commune }: CommuneCodesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Official Identification Codes
        </CardTitle>
        <CardDescription>
          Municipal codes for administrative and statistical purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Municipal Code
              </Label>
              <p className="font-mono text-lg">{commune.code}</p>
            </div>

            {commune.cadastralCode && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Cadastral Code
                </Label>
                <p className="font-mono">{commune.cadastralCode}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {commune.nuts1Code && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  NUTS1 Code
                </Label>
                <p className="font-mono">{commune.nuts1Code}</p>
              </div>
            )}

            {commune.nuts2Code && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  NUTS2 Code
                </Label>
                <p className="font-mono">{commune.nuts2Code}</p>
              </div>
            )}

            {commune.nuts3Code && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  NUTS3 Code
                </Label>
                <p className="font-mono">{commune.nuts3Code}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Data Source
              </Label>
              <p>
                <Badge variant="secondary">{commune.sourceId}</Badge>
              </p>
            </div>

            {commune.lastSyncAt && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Synchronized
                </Label>
                <p className="text-sm">
                  {new Date(commune.lastSyncAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
