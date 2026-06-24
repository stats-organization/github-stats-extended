import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ThemeOption {
  /** DaisyUI theme name, used as the `data-theme` value. */
  name: string;
  label: string;
  /** Whether the theme has a dark background (drives toast styling, etc.). */
  isDark: boolean;
}

/**
 * Themes exposed in the theme picker.
 * Keep in sync with the `themes:` list in `index.css`.
 */
export const THEMES: ReadonlyArray<ThemeOption> = [
  { name: "light", label: "Light", isDark: false },
  { name: "dark", label: "Dark", isDark: true },
];

const DEFAULT_LIGHT_THEME = "light";
const DEFAULT_DARK_THEME = "dark";

function isValidTheme(name: string | null): name is string {
  return !!name && THEMES.some((theme) => theme.name === name);
}

export function isDarkTheme(name: string): boolean {
  return THEMES.find((theme) => theme.name === name)?.isDark ?? false;
}

/**
 * @public
 * Exported so the inferred store type can name it (see the note in `user.ts`).
 */
export interface ThemeState {
  theme: string;
}

function getInitialTheme(): string {
  const stored = localStorage.getItem("theme");
  if (isValidTheme(stored)) {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DEFAULT_DARK_THEME
    : DEFAULT_LIGHT_THEME;
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      const theme = action.payload;
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      state.theme = theme;
    },
  },
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;
