import { OWNER_AFFILIATIONS } from "./constants.js";

/**
 * A general message to ask user to try again later.
 */
const TRY_AGAIN_LATER = "Please try again later";

/**
 * A map of error types to secondary error messages.
 */
const SECONDARY_ERROR_MESSAGES = {
  MAX_RETRY:
    "You can deploy own instance or wait until public will be no longer limited",
  NO_TOKENS:
    "Please add an env variable called PAT_1 with your GitHub API token in vercel",
  USER_NOT_FOUND: "Make sure the provided username is not an organization",
  GRAPHQL_ERROR: TRY_AGAIN_LATER,
  GITHUB_REST_API_ERROR: TRY_AGAIN_LATER,
  WAKATIME_USER_NOT_FOUND: "Make sure you have a public WakaTime profile",
  INVALID_AFFILIATION: `Invalid owner affiliations. Valid values are: ${OWNER_AFFILIATIONS.join(
    ", ",
  )}`,
};

/**
 * Custom error class to handle custom GRS errors.
 */
class CustomError extends Error {
  type: string;
  secondaryMessage: string;

  /**
   * Custom error constructor.
   *
   * @param message Error message.
   * @param type Error type.
   */
  constructor(message: string, type: string) {
    super(message);
    this.type = type;
    type PartialRecord = Partial<Record<string, string>>;
    this.secondaryMessage =
      (SECONDARY_ERROR_MESSAGES as PartialRecord)[type] ?? type;
  }

  static MAX_RETRY = "MAX_RETRY";
  static NO_TOKENS = "NO_TOKENS";
  static USER_NOT_FOUND = "USER_NOT_FOUND";
  static GRAPHQL_ERROR = "GRAPHQL_ERROR";
  static GITHUB_REST_API_ERROR = "GITHUB_REST_API_ERROR";
  static WAKATIME_ERROR = "WAKATIME_ERROR";
  static INVALID_AFFILIATION = "INVALID_AFFILIATION";
}

/**
 * Missing query parameter class.
 */
class MissingParamError extends Error {
  missedParams: Array<string>;
  secondaryMessage: string | undefined;

  /**
   * Missing query parameter error constructor.
   *
   * @param missedParams An array of missing parameters names.
   * @param secondaryMessage Optional secondary message to display.
   */
  constructor(missedParams: Array<string>, secondaryMessage?: string) {
    const msg = `Missing params ${missedParams
      .map((p) => `"${p}"`)
      .join(", ")} make sure you pass the parameters in URL`;
    super(msg);
    this.missedParams = missedParams;
    this.secondaryMessage = secondaryMessage;
  }
}

/**
 * Retrieve secondary message from an error object.
 *
 * @param err The error object.
 * @returns The secondary message if available, otherwise undefined.
 */
const retrieveSecondaryMessage = (err: Error): string | undefined => {
  return "secondaryMessage" in err && typeof err.secondaryMessage === "string"
    ? err.secondaryMessage
    : undefined;
};

export {
  CustomError,
  MissingParamError,
  SECONDARY_ERROR_MESSAGES,
  TRY_AGAIN_LATER,
  retrieveSecondaryMessage,
};
