// @ts-check

import { renderRepoCard } from "../src/cards/repo.js";
import { guardAccess } from "../src/common/access.js";
import {
  CACHE_TTL,
  resolveCacheSeconds,
  setCacheHeaders,
  setErrorCacheHeaders,
} from "../src/common/cache.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../src/common/error.js";
import { parseBoolean } from "../src/common/ops.js";
import { parseArray } from "../src/common/ops.js";
import { renderError } from "../src/common/render.js";
import { fetchRepo } from "../src/fetchers/repo.js";
import { isLocaleAvailable } from "../src/translations.js";
import { storeRequest } from "../src/common/database.js";

// @ts-ignore
export default async (req, res) => {
  const {
    username,
    repo,
    hide_border,
    title_color,
    icon_color,
    text_color,
    bg_color,
    card_width,
    theme,
    show_owner,
    show,
    show_icons,
    number_format,
    text_bold,
    line_height,
    cache_seconds,
    locale,
    border_radius,
    border_color,
    description_lines_count,
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  const access = guardAccess({
    res,
    id: username,
    type: "username",
    colors: {
      title_color,
      text_color,
      bg_color,
      border_color,
      theme,
    },
  });
  if (!access.isPassed) {
    return access.result;
  }

  if (locale && !isLocaleAvailable(locale)) {
    return res.send(
      renderError({
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
    );
  }

  const safePattern = /^[-\w/.,]+$/;
  if (
    (username && !safePattern.test(username)) ||
    (repo && !safePattern.test(repo))
  ) {
    return res.send(
      renderError({
        message: "Something went wrong",
        secondaryMessage: "Username or repository contains unsafe characters",
        renderOptions: {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
        },
      }),
    );
  }

  try {
    await storeRequest(req);
    const showStats = parseArray(show);
    const repoData = await fetchRepo(
      username,
      repo,
      showStats.includes("prs_authored"),
      showStats.includes("prs_commented"),
      showStats.includes("prs_reviewed"),
      showStats.includes("issues_authored"),
      showStats.includes("issues_commented"),
    );

    const cacheSeconds = resolveCacheSeconds({
      requested: parseInt(cache_seconds, 10),
      def: CACHE_TTL.PIN_CARD.DEFAULT,
      min: CACHE_TTL.PIN_CARD.MIN,
      max: CACHE_TTL.PIN_CARD.MAX,
    });

    setCacheHeaders(res, cacheSeconds);

    return res.send(
      renderRepoCard(repoData, {
        hide_border: parseBoolean(hide_border),
        title_color,
        icon_color,
        text_color,
        bg_color,
        theme,
        border_radius,
        border_color,
        card_width_input: parseInt(card_width, 10),
        show_owner: parseBoolean(show_owner),
        show: showStats,
        show_icons: parseBoolean(show_icons),
        number_format,
        text_bold: parseBoolean(text_bold),
        line_height,
        username,
        locale: locale ? locale.toLowerCase() : null,
        description_lines_count,
      }),
    );
  } catch (err) {
    setErrorCacheHeaders(res);
    if (err instanceof Error) {
      return res.send(
        renderError({
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
      );
    }
    return res.send(
      renderError({
        message: "An unknown error occurred",
        renderOptions: {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
        },
      }),
    );
  }
};
