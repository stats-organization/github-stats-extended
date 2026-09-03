import type { ColorParams } from "../common/color.js";

/**
 * Options every card accepts.
 * Cards spread these into `getLightDarkColors`, hence {@link ColorParams}.
 */
export interface CommonCardOptions extends ColorParams {
  title_color: string;
  icon_color: string;
  text_color: string;
  bg_color: string;
  border_radius: number;
  border_color: string;
  hide_border: boolean;
}

/** `Partial<T>` that also accepts an explicit `undefined`, as api handlers forward. */
export type CardOptions<T> = { [K in keyof T]?: T[K] | undefined };
