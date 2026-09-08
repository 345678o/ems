export type EventTheme = {
  primary: string;
  dark: string;
  light: string;
};

export const DEFAULT_EVENT_THEME: EventTheme = {
  primary: "#7c3aed",
  dark: "#2563eb",
  light: "#ec4899",
};

export function eventGradientCss(theme: EventTheme): {
  dark: string;
  light: string;
} {
  return {
    dark: `linear-gradient(160deg, ${theme.dark} 0%, ${theme.primary} 45%, #000000 100%)`,
    light: `linear-gradient(160deg, ${theme.light} 0%, #ffffff 60%, #ffffff 100%)`,
  };
}
