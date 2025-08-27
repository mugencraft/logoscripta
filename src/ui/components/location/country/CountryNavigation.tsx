import { Link } from "@tanstack/react-router";

import type { Country } from "@/domain/models/location/country";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import type { LinkParams } from "@/ui/components/layout/types";

interface CountryNavigationProps {
  country: Country;
  links: Record<string, LinkParams>;
}

export const CountryNavigation = ({
  country,
  links,
}: CountryNavigationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Explore Administrative Divisions</CardTitle>
        <CardDescription>
          Browse the administrative hierarchy for {country.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {Object.entries(links).map(([key, link]) => (
            <Link key={key} to={link.link.to}>
              <Badge
                variant="outline"
                className="px-3 py-2 cursor-pointer hover:bg-muted"
              >
                {link.label} →
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
