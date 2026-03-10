/* eslint-disable import-x/no-unresolved */
import {
  CACHE_TTL,
  resolveCacheSeconds,
  setCacheHeaders,
  setErrorCacheHeaders,
} from "../../../../src/common/cache.js";
import { storeRequest } from "../../../../src/common/database.js";

import { default as authenticate } from "./api-renamed/authenticate.js";
import { default as deleteUser } from "./api-renamed/delete-user.js";
import { default as downgrade } from "./api-renamed/downgrade.js";
import { default as gist } from "./api-renamed/gist.js";
import { default as api } from "./api-renamed/index.js";
import { default as pin } from "./api-renamed/pin.js";
import { default as repeatRecent } from "./api-renamed/repeat-recent.js";
import { default as patInfo } from "./api-renamed/status/pat-info.js";
import { default as statusUp } from "./api-renamed/status/up.js";
import { default as topLangs } from "./api-renamed/top-langs.js";
import { default as userAccess } from "./api-renamed/user-access.js";
import { default as wakatimeProxy } from "./api-renamed/wakatime-proxy.js";
import { default as wakatime } from "./api-renamed/wakatime.js";

// TODO: move out of package

export default async (req, res) => {
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
  const url = new URL(req.url, "https://localhost");
  req.query = Object.fromEntries(url.searchParams.entries());

  let result;

  switch (url.pathname) {
    case "/api":
      result = await api(req.query);
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
    case "/api/gist":
      result = await gist(req.query);
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
    case "/api/pin":
      result = await pin(req.query);
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
    case "/api/top-langs":
      result = await topLangs(req.query);
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
    case "/api/wakatime":
      result = await wakatime(req.query);
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
