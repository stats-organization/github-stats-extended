/**
 * `emoji-name-map` ships no type definitions and exposes no `exports` map, so it
 * cannot be resolved under `nodenext`. Declare the minimal surface used here.
 */
declare module "emoji-name-map" {
  const emojiNameMap: {
    get(name: string): string | undefined;
  };
  export default emojiNameMap;
}
