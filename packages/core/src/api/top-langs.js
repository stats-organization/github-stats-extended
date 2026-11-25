import { renderTopLanguages } from "../cards/top-languages.js";
import { findInvalidColorParam, pickColorParams } from "../common/color.js";
import {
  MissingParamError,
  describeError,
  retrieveSecondaryMessage,
} from "../common/error.js";
import { parseArray, parseBoolean } from "../common/ops.js";
import { renderError } from "../common/render.js";
import { fetchTopLanguages } from "../fetchers/top-languages.js";
import { isLocaleAvailable } from "../translations.js";

// @ts-ignore
export default async (
  {
    username,
    hide,
    hide_title,
    hide_border,
    card_width,
    layout,
    langs_count,
    exclude_repo,
    size_weight,
    count_weight,
    custom_title,
    locale,
    border_radius,
    role,
    pushed_after,
    pushed_before,
    disable_animations,
    hide_progress,
    hide_values,
    stats_format,
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
        secondaryMessage: "Locale not found",
        renderOptions: colorParams,
      }),
    };
  }

  const safePattern = /^[-\w/.,]+$/;
  if (username && !safePattern.test(username)) {
    return {
      status: "error - permanent",
      content: renderError({
        message: "Something went wrong",
        secondaryMessage: "Username contains unsafe characters",
        renderOptions: colorParams,
      }),
    };
  }

  if (
    layout !== undefined &&
    !["compact", "normal", "donut", "donut-vertical", "pie"].includes(layout)
  ) {
    return {
      status: "error - permanent",
      content: renderError({
        message: "Something went wrong",
        secondaryMessage: "Incorrect layout input",
        renderOptions: colorParams,
      }),
    };
  }

  if (
    stats_format !== undefined &&
    !["bytes", "percentages", "both"].includes(stats_format)
  ) {
    return {
      status: "error - permanent",
      content: renderError({
        message: "Something went wrong",
        secondaryMessage: "Incorrect stats_format input",
        renderOptions: colorParams,
      }),
    };
  }

  // accepts YYYY, YYYY-MM or YYYY-MM-DD (UTC); null when absent, undefined when invalid
  const parseDateParam = (value) => {
    if (value === undefined) {
      return null;
    }
    if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(value)) {
      return undefined;
    }
    const date = new Date(value);
    // rejects impossible dates like 2024-02-30, which Date rolls over
    const isExact =
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, value.length) === value;
    return isExact ? date : undefined;
  };
  const pushedAfter = parseDateParam(pushed_after);
  const pushedBefore = parseDateParam(pushed_before);
  for (const [name, parsed] of [
    ["pushed_after", pushedAfter],
    ["pushed_before", pushedBefore],
  ]) {
    if (parsed === undefined) {
      return {
        status: "error - permanent",
        content: renderError({
          message: "Something went wrong",
          secondaryMessage: `Invalid date input for parameter "${name}"`,
          renderOptions: colorParams,
        }),
      };
    }
  }

  try {
    const topLangs = await fetchTopLanguages(
      username,
      parseArray(exclude_repo),
      size_weight,
      count_weight,
      parseArray(role),
      pat,
      { after: pushedAfter, before: pushedBefore },
    );

    return {
      status: "success",
      content: renderTopLanguages(topLangs, {
        ...colorParams,
        custom_title,
        hide_title: parseBoolean(hide_title),
        hide_border: parseBoolean(hide_border),
        card_width: parseInt(card_width, 10),
        hide: parseArray(hide),
        layout,
        langs_count,
        border_radius,
        locale: locale ? locale.toLowerCase() : null,
        disable_animations: parseBoolean(disable_animations),
        hide_progress: parseBoolean(hide_progress),
        hide_values: parseBoolean(hide_values),
        stats_format,
      }),
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: "error - temporary",
        error: describeError(err),
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
