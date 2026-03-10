// @ts-check

import { renderRepoCard } from "../src/cards/repo.js";
import { guardAccess } from "../src/common/access.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../src/common/error.js";
import { parseArray, parseBoolean } from "../src/common/ops.js";
import { renderError } from "../src/common/render.js";
import { fetchRepo } from "../src/fetchers/repo.js";
import { isLocaleAvailable } from "../src/translations.js";

// @ts-ignore
export default async ({
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
  locale,
  border_radius,
  border_color,
  description_lines_count,
}) => {
  const access = guardAccess({
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
    return { status: "error - permanent", content: access.result };
  }

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

  const safePattern = /^[-\w/.,]+$/;
  if (
    (username && !safePattern.test(username)) ||
    (repo && !safePattern.test(repo))
  ) {
    return {
      status: "error - permanent",
      content: renderError({
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
    };
  }

  try {
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

    return {
      status: "success",
      content: renderRepoCard(repoData, {
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
