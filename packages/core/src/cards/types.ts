import type { themes } from "../themes/index.js";

type ThemeNames = keyof typeof themes;

export interface CommonOptions {
  title_color: string;
  icon_color: string;
  text_color: string;
  bg_color: string;
  theme: ThemeNames;
  border_radius: number;
  border_color: string;
  locale: string;
  hide_border: boolean;
}

export interface WakaTimeOptions extends CommonOptions {
  hide_title: boolean;
  hide: Array<string>;
  card_width: number;
  line_height: string;
  hide_progress: boolean;
  custom_title: string;
  layout: "compact" | "normal";
  langs_count: number;
  display_format: "time" | "percent";
  disable_animations: boolean;
}
