/**
 * `@uppercod/css-to-object` ships type definitions but does not expose them
 * through its package.json `exports` map, so they cannot be resolved under
 * `nodenext`. Declare the minimal surface used in tests here.
 */
declare module "@uppercod/css-to-object" {
  export type CssObject = Record<
    string,
    Record<string, Record<string, string>>
  >;
  export function cssToObject(css: string): CssObject;
}
