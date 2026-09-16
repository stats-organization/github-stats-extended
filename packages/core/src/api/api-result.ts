import type { ErrorDetails } from "../common/error.js";

/** What every api handler returns: a rendered card, or a rendered error. */
export interface ApiResult {
  status: "success" | "error - permanent" | "error - temporary";
  error?: ErrorDetails;
  content: string;
}
