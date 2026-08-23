import type { ThemeName } from "../themes/index.js";

export interface CommonOptions {
  title_color: string;
  icon_color: string;
  text_color: string;
  bg_color: string;
  theme: ThemeName;
  border_radius: number;
  border_color: string;
  locale: string;
  hide_border: boolean;
}
