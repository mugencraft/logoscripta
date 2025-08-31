export interface BaseFormProps<T> {
  mode: "create" | "edit";
  data?: T;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormFieldType = "text" | "textarea" | "number" | "select" | "checkbox";

export interface FormFieldProps {
  label: string;
  description?: string;
  placeholder?: string;
  type?: FormFieldType;
  required?: boolean;
}
