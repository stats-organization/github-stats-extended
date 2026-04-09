import {
  api,
  gist,
  pin,
  topLangs,
  wakatime,
} from "@stats-organization/github-readme-stats-core";

import { default as authenticate } from "./api-renamed/authenticate.js";
import { default as deleteUser } from "./api-renamed/delete-user.js";
import { default as downgrade } from "./api-renamed/downgrade.js";
import { default as repeatRecent } from "./api-renamed/repeat-recent.js";
import { default as patInfo } from "./api-renamed/status/pat-info.js";
import { default as statusUp } from "./api-renamed/status/up.js";
import { default as userAccess } from "./api-renamed/user-access.js";
import { default as wakatimeProxy } from "./api-renamed/wakatime-proxy.js";
import { guardAccess } from "./src/common/access.js";
import {
  CACHE_TTL,
  resolveCacheSeconds,
  setCacheHeaders,
  setErrorCacheHeaders,
} from "./src/common/cache.js";
import { getUserAccessByName, storeRequest } from "./src/common/database.js";

const getGuardResult = (query, type, id) => {
  const access = guardAccess({
    id,
    type,
    colors: {
      title_color: query.title_color,
      text_color: query.text_color,
      bg_color: query.bg_color,
      border_color: query.border_color,
      theme: query.theme,
    },
  });

  if (access.isPassed) {
    return null;
  }

  return {
    status: "error - permanent",
    content: access.result,
  };
};

const getUserPat = async (username) => {
  if (!username) {
    return null;
  }

  const userAccess = await getUserAccessByName(username);
  if (!userAccess?.token) {
    return null;
  }

  return userAccess.token;
};

export default async (req, res) => {
  const url = new URL(req.url, "https://localhost");
  if (res.send === undefined) {
    // remaining code expects express.js-like request and response objects
    res.send = function (data) {
      if (typeof data === "object") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      } else if (typeof data === "string") {
        res.end(data);
      } else {
        res.end(String(data));
      }
    };
    req.query = Object.fromEntries(url.searchParams.entries());
  }

  let result;

  switch (url.pathname) {
    case "/api": {
      result = getGuardResult(req.query, "username", req.query.username);
      if (!result) {
        const userPat = await getUserPat(req.query.username);
        result = await api(req.query, userPat);
      }
      if (result.status === "error - temporary") {
        setErrorCacheHeaders(res);
      } else {
        const cacheSeconds = resolveCacheSeconds({
          requested: parseInt(req.query.cache_seconds, 10),
          def: CACHE_TTL.STATS_CARD.DEFAULT,
          min: CACHE_TTL.STATS_CARD.MIN,
          max: CACHE_TTL.STATS_CARD.MAX,
        });
        setCacheHeaders(res, cacheSeconds);
      }
      res.setHeader("Content-Type", "image/svg+xml");
      res.end(result.content);
      if (result.status !== "error - permanent") {
        await storeRequest(req);
      }
      break;
    }
    case "/api/gist":
      result =
        getGuardResult(req.query, "gist", req.query.id) ??
        (await gist(req.query));
      if (result.status === "error - temporary") {
        setErrorCacheHeaders(res);
      } else {
        const cacheSeconds = resolveCacheSeconds({
          requested: parseInt(req.query.cache_seconds, 10),
          def: CACHE_TTL.GIST_CARD.DEFAULT,
          min: CACHE_TTL.GIST_CARD.MIN,
          max: CACHE_TTL.GIST_CARD.MAX,
        });
        setCacheHeaders(res, cacheSeconds);
      }
      res.setHeader("Content-Type", "image/svg+xml");
      res.end(result.content);
      if (result.status !== "error - permanent") {
        await storeRequest(req);
      }
      break;
    case "/api/pin": {
      result = getGuardResult(req.query, "username", req.query.username);
      if (!result) {
        const userPat = await getUserPat(req.query.username);
        result = await pin(req.query, userPat);
      }
      if (result.status === "error - temporary") {
        setErrorCacheHeaders(res);
      } else {
        const cacheSeconds = resolveCacheSeconds({
          requested: parseInt(req.query.cache_seconds, 10),
          def: CACHE_TTL.PIN_CARD.DEFAULT,
          min: CACHE_TTL.PIN_CARD.MIN,
          max: CACHE_TTL.PIN_CARD.MAX,
        });
        setCacheHeaders(res, cacheSeconds);
      }
      res.setHeader("Content-Type", "image/svg+xml");
      res.end(result.content);
      if (result.status !== "error - permanent") {
        await storeRequest(req);
      }
      break;
    }
    case "/api/top-langs": {
      result = getGuardResult(req.query, "username", req.query.username);
      if (!result) {
        const userPat = await getUserPat(req.query.username);
        result = await topLangs(req.query, userPat);
      }
      if (result.status === "error - temporary") {
        setErrorCacheHeaders(res);
      } else {
        const cacheSeconds = resolveCacheSeconds({
          requested: parseInt(req.query.cache_seconds, 10),
          def: CACHE_TTL.TOP_LANGS_CARD.DEFAULT,
          min: CACHE_TTL.TOP_LANGS_CARD.MIN,
          max: CACHE_TTL.TOP_LANGS_CARD.MAX,
        });
        setCacheHeaders(res, cacheSeconds);
      }
      res.setHeader("Content-Type", "image/svg+xml");
      res.end(result.content);
      if (result.status !== "error - permanent") {
        await storeRequest(req);
      }
      break;
    }
    case "/api/wakatime":
      result =
        getGuardResult(req.query, "wakatime", req.query.username) ??
        (await wakatime(req.query));
      if (result.status === "error - temporary") {
        setErrorCacheHeaders(res);
      } else {
        const cacheSeconds = resolveCacheSeconds({
          requested: parseInt(req.query.cache_seconds, 10),
          def: CACHE_TTL.WAKATIME_CARD.DEFAULT,
          min: CACHE_TTL.WAKATIME_CARD.MIN,
          max: CACHE_TTL.WAKATIME_CARD.MAX,
        });
        setCacheHeaders(res, cacheSeconds);
      }
      res.setHeader("Content-Type", "image/svg+xml");
      res.end(result.content);
      if (result.status !== "error - permanent") {
        await storeRequest(req);
      }
      break;
    case "/api/wakatime-proxy":
      await wakatimeProxy(req, res);
      break;
    case "/api/repeat-recent":
      await repeatRecent(req, res);
      break;
    case "/api/status/pat-info":
      await patInfo(req, res);
      break;
    case "/api/status/up":
      await statusUp(req, res);
      break;
    case "/api/authenticate":
      await authenticate(req, res);
      break;
    case "/api/delete-user":
      await deleteUser(req, res);
      break;
    case "/api/user-access":
      await userAccess(req, res);
      break;
    case "/api/downgrade":
      await downgrade(req, res);
      break;
    default:
      res.statusCode = 404;
      res.end("Not Found");
      break;
  }
};
