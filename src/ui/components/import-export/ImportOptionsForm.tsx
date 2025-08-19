import { Checkbox } from "@/ui/components/core/checkbox";
import { Label } from "@/ui/components/core/label";

interface ImportOption {
  id: string;
  label: string;
  description?: string;
  defaultValue?: boolean;
  disabled?: boolean;
  conflictsWith?: string[]; // IDs of conflicting options
}

interface ImportOptionsFormProps {
  domain: string; // "system", "collection", etc.
  options: ImportOption[];
  values: Record<string, boolean>;
  onChange: (optionId: string, checked: boolean) => void;
}

export function ImportOptionsForm({
  domain,
  options,
  values,
  onChange,
}: ImportOptionsFormProps) {
  const handleOptionChange = (optionId: string, checked: boolean) => {
    // Handle conflicting options automatically
    const option = options.find((opt) => opt.id === optionId);
    if (option?.conflictsWith && checked) {
      // Disable conflicting options
      for (const conflictId of option.conflictsWith) {
        if (values[conflictId]) {
          onChange(conflictId, false);
        }
      }
    }
    onChange(optionId, checked);
  };

  const getOptionDescription = (option: ImportOption) => {
    if (option.id === "overwrite") {
      return `Warning: This will completely replace the existing ${domain}`;
    }
    if (option.id === "renameIfExists") {
      return `${domain.charAt(0).toUpperCase() + domain.slice(1)} will be renamed automatically if name conflicts exist`;
    }
    return (
      option.description ||
      `Import will fail if a ${domain} with the same name exists`
    );
  };

  return (
    <div className="space-y-3 p-3 border rounded-lg">
      <h4 className="text-sm font-medium">Import Options</h4>

      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={option.id}
            checked={values[option.id] || option.defaultValue || false}
            disabled={option.disabled}
            onCheckedChange={(checked) =>
              handleOptionChange(option.id, Boolean(checked))
            }
          />
          <Label htmlFor={option.id} className="text-sm cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}

      <p className="text-xs text-muted-foreground">
        {getOptionDescription(
          options.find((opt) => values[opt.id]) || (options[0] as ImportOption),
        )}
      </p>
    </div>
  );
}
