import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import { format } from "node:util";

import { logger } from "@stats-organization/github-readme-stats-core";

interface RequestContext {
  requestId: string;
  url: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

for (const level of ["log", "error", "warn", "info", "debug"] as const) {
  const write = console[level].bind(console);
  console[level] = (...args: Array<unknown>): void => {
    const prefix = JSON.stringify(
      requestContext.getStore() ?? { source: "system" },
    );
    for (const line of format(...args).split(/\r\n|\r|\n/)) {
      write(`${prefix} ${line}`);
    }
  };
}

logger.log = console.log;
logger.error = console.error;

export function requestLogging<T>(
  req: { originalUrl: string; headers: IncomingHttpHeaders },
  _res: unknown,
  next: () => T,
): T {
  const flyRequestId = req.headers["fly-request-id"];
  const requestId =
    typeof flyRequestId === "string" && flyRequestId
      ? flyRequestId
      : randomUUID();
  const context = {
    requestId,
    url: req.originalUrl,
  };
  return requestContext.run(context, next);
}
