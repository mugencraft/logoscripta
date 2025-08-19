import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "./context";
import { SubmitButton } from "./elements/SubmitButton";
import {
  CheckboxField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields/base";
import { ColorField } from "./fields/color";
import IconField from "./fields/icon";
import { RelationSelectField } from "./fields/relations";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    TextAreaField,
    SelectField,
    CheckboxField,
    NumberField,
    ColorField,
    IconField,
    RelationSelectField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
