/** What every api handler returns: a rendered card, or a rendered error. */
export interface ApiResult {
  status: "success" | "error - permanent" | "error - temporary";
  content: string;
}
