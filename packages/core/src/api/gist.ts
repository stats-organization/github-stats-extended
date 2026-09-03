import { renderGistCard } from "../cards/gist.js";
import type { ColorParams } from "../common/color.js";
import { findInvalidColorParam, pickColorParams } from "../common/color.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../common/error.js";
import { parseBoolean } from "../common/ops.js";
import { renderError } from "../common/render.js";
import { fetchGist } from "../fetchers/gist.js";

import type { ApiResult } from "./api-result.js";

/** Query params the gist endpoint accepts, on top of the shared color params. */
interface GistApiQuery extends ColorParams {
  id?: string;
  border_radius?: string;
  show_owner?: string;
  browser_rendering?: string;
  hide_border?: string;
}

/** Characters a gist ID may contain. */
const SAFE_PATTERN = /^[-\w/.,]+$/;

/**
 * Render the gist card for a set of query params.
 *
 * @param query Raw query params.
 * @param query.id GitHub gist ID.
 * @param query.border_radius Card border radius.
 * @param query.show_owner Whether to show the gist owner.
 * @param query.browser_rendering Whether the browser wraps the description text.
 * @param query.hide_border Whether to hide the card border.
 * @param pat Optional PAT override.
 * @returns The rendered card, or a rendered error.
 */
export default async (
  {
    id,
    border_radius,
    show_owner,
    browser_rendering,
    hide_border,
    ...remainingParams
  }: GistApiQuery,
  pat: string | null = null,
): Promise<ApiResult> => {
  const colorParams = pickColorParams(remainingParams);

  const invalidColorInput = findInvalidColorParam(colorParams);
  if (invalidColorInput) {
    return {
      status: "error - permanent",
      content: renderError({
        message: "Something went wrong",
        secondaryMessage: `Invalid color input for parameter "${invalidColorInput}"`,
      }),
    };
  }

  const borderRadius =
    border_radius === undefined ? undefined : parseFloat(border_radius);
  if (borderRadius !== undefined && !Number.isFinite(borderRadius)) {
    return {
      status: "error - permanent",
      content: renderError({
        message: "Something went wrong",
        secondaryMessage: 'Invalid number input for parameter "border_radius"',
        renderOptions: colorParams,
      }),
    };
  }

  if (id && !SAFE_PATTERN.test(id)) {
    return {
      status: "error - permanent",
      content: renderError({
        message: "Something went wrong",
        secondaryMessage: "Gist ID contains unsafe characters",
        renderOptions: colorParams,
      }),
    };
  }

  try {
    const gistData = await fetchGist(id, pat);

    return {
      status: "success",
      content: renderGistCard(gistData, {
        ...colorParams,
        border_radius: borderRadius,
        show_owner: parseBoolean(show_owner),
        browser_rendering: parseBoolean(browser_rendering),
        hide_border: parseBoolean(hide_border),
      }),
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: "error - temporary",
        content: renderError({
          message: err.message,
          secondaryMessage: retrieveSecondaryMessage(err),
          renderOptions: {
            ...colorParams,
            show_repo_link: !(err instanceof MissingParamError),
          },
        }),
      };
    }
    return {
      status: "error - temporary",
      content: renderError({
        message: "An unknown error occurred",
        renderOptions: colorParams,
      }),
    };
  }
};
