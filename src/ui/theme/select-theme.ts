import type { Theme } from "react-select";

export const selectTheme = (theme: Theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: "var(--color-primary)",
    primary25: "var(--color-primary-300)",
    primary50: "var(--color-primary-500)",
    primary75: "var(--color-primary-800)",
    neutral0: "var(--color-mono-50)",
    neutral5: "var(--color-mono-100)",
    neutral10: "var(--color-mono-200)",
    neutral20: "var(--color-mono-300)",
    neutral30: "var(--color-mono-400)",
    neutral40: "var(--color-mono-500)",
    neutral50: "var(--color-mono-600)",
    neutral60: "var(--color-mono-700)",
    neutral70: "var(--color-mono-800)",
    neutral80: "var(--color-mono-900)",
    neutral90: "var(--color-mono-950)",
  },
});
