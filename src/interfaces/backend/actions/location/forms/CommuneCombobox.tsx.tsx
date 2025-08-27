import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";

import { trpc } from "@/interfaces/server-client";

import { Button } from "@/ui/components/core/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/ui/components/core/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/core/popover";

import { CommuneCommandItem } from "./CommuneCommandItem";

interface CommuneComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  countryCode?: string;
  regionCode?: string;
  provinceCode?: string;
}

export function CommuneCombobox({
  value,
  onValueChange,
  placeholder = "Select commune...",
  countryCode = "IT", // Default Italia
}: CommuneComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const { data: regions, isLoading: isLoadingRegions } =
    trpc.location.regions.getAllWithStats.useQuery(
      { countryCode },
      { enabled: open },
    );

  const { data: provinces, isLoading: isLoadingProvinces } =
    trpc.location.provinces.getAllWithStats.useQuery(
      { regionCode: selectedRegion },
      { enabled: !!selectedRegion },
    );

  const shouldShowDefaults = !selectedRegion && !debouncedQuery;
  const shouldSearch = debouncedQuery.length >= 2;
  const shouldShowCapitals = !!selectedRegion && !shouldSearch;

  const { data: mostUsed } = trpc.location.communes.getMostUsed.useQuery(
    { limit: 8, countryCode },
    { enabled: shouldShowDefaults },
  );

  const { data: recentlyUsed } =
    trpc.location.communes.getRecentlyUsed.useQuery(
      { limit: 5 },
      { enabled: shouldShowDefaults },
    );

  console.log(shouldShowDefaults);
  console.log(mostUsed);
  console.log(recentlyUsed);

  const { data: searchResults, isLoading: isLoadingSearchResults } =
    trpc.location.communes.search.useQuery(
      {
        nameQuery: debouncedQuery,
        countryCode,
        regionCode: selectedRegion,
        provinceCode: selectedProvince,
        limit: 50,
      },
      { enabled: shouldSearch },
    );

  const { data: capitals, isLoading: isLoadingCapitals } =
    trpc.location.communes.search.useQuery(
      {
        regionCode: selectedRegion,
        provinceCode: selectedProvince,
        limit: 500,
        onlyCapitals: selectedProvince === "",
      },
      { enabled: shouldShowCapitals },
    );

  const resetFilters = () => {
    setSelectedRegion("");
    setSelectedProvince("");
  };

  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setSelectedProvince("");
  };

  const handleProvinceSelect = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value ? `${value}` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search communes..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />

          {!shouldSearch && (
            <div className="p-3 border-b space-y-2">
              <div className="flex gap-2">
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionSelect(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                >
                  <option value="">All regions</option>
                  {regions?.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </select>

                {selectedRegion && (
                  <select
                    value={selectedProvince}
                    onChange={(e) => handleProvinceSelect(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  >
                    <option value="">Province capitals only</option>
                    {provinces?.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                )}

                {(selectedRegion || selectedProvince) && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                )}
              </div>
            </div>
          )}

          <CommandList>
            {isLoadingRegions ||
            isLoadingProvinces ||
            isLoadingProvinces ||
            isLoadingSearchResults ||
            isLoadingCapitals ? (
              <CommandEmpty>Loading...</CommandEmpty>
            ) : (
              <CommandEmpty>No communes found.</CommandEmpty>
            )}

            {!!shouldShowDefaults && (
              <>
                {!!recentlyUsed?.length && recentlyUsed.length > 0 && (
                  <CommandGroup heading="Recently Used">
                    {recentlyUsed.map((commune) => (
                      <CommuneCommandItem
                        key={`recent-${commune.code}`}
                        commune={commune}
                        isSelected={value === commune.code}
                        onSelect={() => {
                          onValueChange(commune.code);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </CommandGroup>
                )}

                {!!mostUsed?.length && mostUsed.length > 0 && (
                  <CommandGroup heading="Most Used">
                    {mostUsed.map((commune) => (
                      <CommuneCommandItem
                        key={`used-${commune.code}`}
                        commune={commune}
                        isSelected={value === commune.code}
                        onSelect={() => {
                          onValueChange(commune.code);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </CommandGroup>
                )}
              </>
            )}

            {!!shouldSearch &&
              searchResults?.length &&
              searchResults.length > 0 && (
                <CommandGroup heading="Search Results">
                  {searchResults.map((commune) => (
                    <CommuneCommandItem
                      key={`search-${commune.code}`}
                      commune={commune}
                      isSelected={value === commune.code}
                      onSelect={() => {
                        onValueChange(commune.code);
                        setOpen(false);
                      }}
                    />
                  ))}
                </CommandGroup>
              )}

            {shouldShowCapitals && capitals?.length && capitals.length > 0 && (
              <CommandGroup heading="Province Capitals">
                {capitals.map((commune) => (
                  <CommuneCommandItem
                    key={`capital-${commune.code}`}
                    commune={commune}
                    isSelected={value === commune.code}
                    onSelect={() => {
                      onValueChange(commune.code);
                      setOpen(false);
                    }}
                    showCapitalBadge
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
