import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { isDarkTheme, setTheme as setThemeAction } from "../slices/theme";
import type { StoreState } from "../store";

/**
 * Reads the active DaisyUI theme from the Redux store and exposes a setter
 * that persists the choice and updates the `data-theme` attribute.
 */
export function useTheme(): {
  theme: string;
  isDark: boolean;
  setTheme: (theme: string) => void;
} {
  const dispatch = useDispatch();
  const theme = useSelector((state: StoreState) => state.theme.theme);

  const setTheme = useCallback(
    (next: string) => {
      dispatch(setThemeAction(next));
    },
    [dispatch],
  );

  return { theme, isDark: isDarkTheme(theme), setTheme };
}
