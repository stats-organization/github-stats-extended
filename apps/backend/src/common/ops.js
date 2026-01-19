// @ts-check

import toEmoji from "emoji-name-map";

const OWNER_AFFILIATIONS = ["OWNER", "COLLABORATOR", "ORGANIZATION_MEMBER"];

/**
 * Returns boolean if value is either "true" or "false" else the value as it is.
 *
 * @param {string | boolean} value The value to parse.
 * @returns {boolean | undefined } The parsed value.
 */
const parseBoolean = (value) => {
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
 * @param {string} str The string to parse.
 * @returns {string[]} The array of strings.
 */
const parseArray = (str) => {
  if (!str) {
    return [];
  }
  return str.split(",");
};

/**
 * Clamp the given number between the given range.
 *
 * @param {number} number The number to clamp.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped number.
 */
const clampValue = (number, min, max) => {
  // @ts-ignore
  if (Number.isNaN(parseInt(number, 10))) {
    return min;
  }
  return Math.max(min, Math.min(number, max));
};

/**
 * Lowercase and trim string.
 *
 * @param {string} name String to lowercase and trim.
 * @returns {string} Lowercased and trimmed string.
 */
const lowercaseTrim = (name) => name.toLowerCase().trim();

/**
 * Split array of languages in two columns.
 *
 * @template T Language object.
 * @param {Array<T>} arr Array of languages.
 * @param {number} perChunk Number of languages per column.
 * @returns {Array<T>} Array of languages split in two columns.
 */
const chunkArray = (arr, perChunk) => {
  return arr.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      // @ts-ignore
      resultArray[chunkIndex] = []; // start a new chunk
    }

    // @ts-ignore
    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
};

/**
 * Parse emoji from string.
 *
 * @param {string} str String to parse emoji from.
 * @returns {string} String with emoji parsed.
 */
const parseEmojis = (str) => {
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
 * @param {Date} d1 First date.
 * @param {Date} d2 Second date.
 * @returns {number} Number of minutes between the two dates.
 */
const dateDiff = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diff = date1.getTime() - date2.getTime();
  return Math.round(diff / (1000 * 60));
};

/**
 * Parse owner affiliations.
 *
 * @param {string[]} affiliations input affiliations to be parsed.
 * @returns {string[]} Parsed affiliations.
 *
 * @throws {CustomError} If affiliations contains invalid values.
 */
const parseOwnerAffiliations = (affiliations) => {
  // Set default value for ownerAffiliations.
  // NOTE: Done here since parseArray() will always return an empty array even nothing
  //was specified.
  affiliations =
    affiliations && affiliations.length > 0
      ? affiliations.map((affiliation) => affiliation.toUpperCase())
      : ["OWNER"];

  // Check if ownerAffiliations contains valid values.
  if (
    affiliations.some(
      (affiliation) => !OWNER_AFFILIATIONS.includes(affiliation),
    )
  ) {
    throw new CustomError(
      "Invalid query parameter",
      CustomError.INVALID_AFFILIATION,
    );
  }
  return affiliations;
};

const buildSearchFilter = (repos = [], owners = []) => {
  let repoFilter =
    Array.isArray(repos) && repos.length > 0
      ? repos.map((r) => `repo:${r} `).join("")
      : "";
  let orgFilter =
    Array.isArray(owners) && owners.length > 0
      ? owners.map((o) => `owner:${o} `).join("")
      : "";
  return repoFilter + orgFilter;
};

export {
  OWNER_AFFILIATIONS,
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
