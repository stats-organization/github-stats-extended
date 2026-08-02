import { renderGistCard } from "../cards/gist.js";
import { findInvalidColorParam, pickColorParams } from "../common/color.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../common/error.js";
import { parseBoolean } from "../common/ops.js";
import { renderError } from "../common/render.js";
import { fetchGist } from "../fetchers/gist.js";
import { isLocaleAvailable } from "../translations.js";

// @ts-ignore
export default async (
  {
    id,
    locale,
    border_radius,
    show_owner,
    browser_rendering,
    hide_border,
    ...remainingParams
  },
  pat = null,
) => {
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

  if (locale && !isLocaleAvailable(locale)) {
    return {
      status: "error - permanent",
      content: renderError({
        message: "Something went wrong",
        secondaryMessage: "Language not found",
        renderOptions: colorParams,
      }),
    };
  }

  const safePattern = /^[-\w/.,]+$/;
  if (id && !safePattern.test(id)) {
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
        border_radius,
        locale: locale ? locale.toLowerCase() : null,
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
