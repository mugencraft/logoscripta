import { Checkbox } from "@/ui/components/core/checkbox";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";
import { Textarea } from "@/ui/components/core/textarea";

import { useFieldContext } from "../context";
import type { FormFieldProps } from "../types";

type FieldError = string | { message: string } | Error;

const FieldErrors = ({ errors }: { errors?: FieldError[] }) => {
  if (!errors?.length) return null;

  return (
    <>
      {errors.map((error) => {
        const errorMessage =
          typeof error === "string"
            ? error
            : error.message || "Validation error";

        return (
          <span key={errorMessage} className="text-destructive text-sm">
            {errorMessage}
          </span>
        );
      })}
    </>
  );
};

interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  fieldName: string;
  errors?: FieldError[];
  children: React.ReactNode;
}

export const FieldWrapper = ({
  label,
  required,
  fieldName,
  errors,
  children,
}: FieldWrapperProps) => (
  <div className="space-y-2">
    {label && (
      <Label htmlFor={fieldName}>
        {label} {required && "*"}
      </Label>
    )}
    {children}
    <FieldErrors errors={errors} />
  </div>
);

export const TextField = ({ label, placeholder, required }: FormFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <FieldWrapper
      label={label}
      required={required}
      fieldName={field.name}
      errors={field.state.meta.errors}
    >
      <Input
        id={field.name}
        value={field.state.value || ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
      />
    </FieldWrapper>
  );
};

export const TextAreaField = ({ label, placeholder }: FormFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <FieldWrapper
      label={label}
      fieldName={field.name}
      errors={field.state.meta.errors}
    >
      <Textarea
        id={field.name}
        value={field.state.value || ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
      />
    </FieldWrapper>
  );
};

export const SelectField = ({
  label,
  placeholder,
  required,
  options = [],
}: FormFieldProps & { options: Array<{ value: string; label: string }> }) => {
  const field = useFieldContext<string>();

  return (
    <FieldWrapper
      label={label}
      required={required}
      fieldName={field.name}
      errors={field.state.meta.errors}
    >
      <Select value={field.state.value} onValueChange={field.handleChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
};

// CheckboxField has a different structure than the other fields
export const CheckboxField = ({ label }: FormFieldProps) => {
  const field = useFieldContext<boolean>();

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={field.state.value}
          onCheckedChange={(e) => field.handleChange(!!e)}
        />
        <Label htmlFor={field.name}>{label}</Label>
      </div>
      <FieldErrors errors={field.state.meta.errors} />
    </div>
  );
};

export const NumberField = ({
  label,
  placeholder = "Enter number",
  min,
  max,
  step = 1,
  required,
}: FormFieldProps & { min?: number; max?: number; step?: number }) => {
  const field = useFieldContext<number>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = Number.parseFloat(e.target.value);
    if (!Number.isNaN(numValue)) {
      field.handleChange(numValue);
    }
  };

  return (
    <FieldWrapper
      label={label}
      required={required}
      fieldName={field.name}
      errors={field.state.meta.errors}
    >
      <Input
        type="number"
        id={field.name}
        value={field.state.value}
        onChange={handleChange}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </FieldWrapper>
  );
};
