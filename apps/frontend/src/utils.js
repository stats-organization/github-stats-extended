/**
 * @param  {Array<string>} classes list of class names
 * @returns string classname attribute
 */
export function classnames(...args) {
  return args.join(" ");
}

export const CardTypes = {
  STATS: "stats",
  TOP_LANGS: "top-langs",
  PIN: "pin",
  GIST: "gist",
  WAKATIME: "wakatime",
};
