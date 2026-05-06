// @ts-check

import { renderGistCard } from "../cards/gist.js";
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
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme,
    locale,
    border_radius,
    border_color,
    show_owner,
    browser_rendering,
    hide_border,
  },
  pat = null,
) => {
  if (locale && !isLocaleAvailable(locale)) {
    return {
      status: "error - permanent",
      content: renderError({
        message: "Something went wrong",
        secondaryMessage: "Language not found",
        renderOptions: {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
        },
      }),
    };
  }

  try {
    const gistData = await fetchGist(id, pat);

    return {
      status: "success",
      content: renderGistCard(gistData, {
        title_color,
        icon_color,
        text_color,
        bg_color,
        theme,
        border_radius,
        border_color,
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
            title_color,
            text_color,
            bg_color,
            border_color,
            theme,
            show_repo_link: !(err instanceof MissingParamError),
          },
        }),
      };
    }
    return {
      status: "error - temporary",
      content: renderError({
        message: "An unknown error occurred",
        renderOptions: {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
        },
      }),
    };
  }
};
