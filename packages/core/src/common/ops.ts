import toEmoji from "emoji-name-map";

import { OWNER_AFFILIATIONS } from "./constants.js";
import { CustomError } from "./error.js";

/**
 * Returns boolean if value is either "true" or "false" else the value as it is.
 *
 * @param value The value to parse.
 * @returns The parsed value.
 */
const parseBoolean = (value: string | boolean): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    } else if (value.toLowerCase() === "false") {
      return false;
    }
  }
  return undefined;
};

/**
 * Parse string to array of strings.
 *
 * @param str The string to parse.
 * @returns The array of strings.
 */
const parseArray = (str: string): Array<string> => {
  if (!str) {
    return [];
  }
  return str.split(",");
};

/**
 * Clamp the given number between the given range.
 *
 * @param number The number to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped number.
 */
const clampValue = (
  number: string | number,
  min: number,
  max: number,
): number => {
  if (Number.isNaN(parseInt(String(number), 10))) {
    return min;
  }
  return Math.max(min, Math.min(Number(number), max));
};

/**
 * Lowercase and trim string.
 *
 * @param name String to lowercase and trim.
 * @returns Lowercased and trimmed string.
 */
const lowercaseTrim = (name: string): string => name.toLowerCase().trim();

/**
 * Split array of languages in two columns.
 *
 * @template T Language object.
 * @param arr Array of languages.
 * @param perChunk Number of languages per column.
 * @returns Array of languages split in two columns.
 */
const chunkArray = <T>(arr: Array<T>, perChunk: number): Array<Array<T>> => {
  return arr.reduce<Array<Array<T>>>((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);
    const chunk = resultArray[chunkIndex] ?? [];
    chunk.push(item);
    resultArray[chunkIndex] = chunk;
    return resultArray;
  }, []);
};

/**
 * Parse emoji from string.
 *
 * @param str String to parse emoji from.
 * @returns String with emoji parsed.
 */
const parseEmojis = (str: string): string => {
  if (!str) {
    throw new Error("[parseEmoji]: str argument not provided");
  }
  return str.replace(/:\w+:/gm, (emoji) => {
    return toEmoji.get(emoji) || "";
  });
};

/**
 * Get diff in minutes between two dates.
 *
 * @param d1 First date.
 * @param d2 Second date.
 * @returns Number of minutes between the two dates.
 */
const dateDiff = (d1: Date, d2: Date): number => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diff = date1.getTime() - date2.getTime();
  return Math.round(diff / (1000 * 60));
};

/**
 * Parse owner affiliations.
 *
 * @param affiliations input affiliations to be parsed.
 * @returns Parsed affiliations.
 *
 * @throws {CustomError} If affiliations contains invalid values.
 */
const parseOwnerAffiliations = (affiliations: Array<string>): Array<string> => {
  // Set default value for ownerAffiliations.
  // NOTE: Done here since parseArray() will always return an empty array even nothing
  //was specified.
  const normalized =
    affiliations.length > 0
      ? affiliations.map((affiliation) => affiliation.toUpperCase())
      : ["OWNER"];

  // Check if ownerAffiliations contains valid values.
  if (
    normalized.some((affiliation) => !OWNER_AFFILIATIONS.includes(affiliation))
  ) {
    throw new CustomError(
      "Invalid query parameter",
      CustomError.INVALID_AFFILIATION,
    );
  }
  return normalized;
};

const buildSearchFilter = (
  repos: Array<string> | string = [],
  owners: Array<string> | string = [],
): string => {
  const repoFilter =
    Array.isArray(repos) && repos.length > 0
      ? repos.map((r) => `repo:${r} `).join("")
      : "";
  const orgFilter =
    Array.isArray(owners) && owners.length > 0
      ? owners.map((o) => `owner:${o} `).join("")
      : "";
  return repoFilter + orgFilter;
};

export {
  parseBoolean,
  parseArray,
  clampValue,
  lowercaseTrim,
  chunkArray,
  parseEmojis,
  dateDiff,
  parseOwnerAffiliations,
  buildSearchFilter,
};
