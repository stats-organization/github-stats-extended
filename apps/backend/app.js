import path from "path";

import express from "express";

import router from "./router.js";

export const app = express();

// Use the last value for duplicate query parameters instead of Express's default `string[]`.
app.set("query parser", (str) =>
  Object.assign(
    Object.create(null),
    Object.fromEntries(new URLSearchParams(str ?? "")),
  ),
);

app.get("/", (req, res) => {
  res.redirect("/frontend/docs/");
});

app.use(
  "/frontend",
  express.static(path.join(import.meta.dirname, "../frontend/build"), {
    maxAge: 3600000,
  }),
);

app.use((req, res) => {
  // drop trailing slash
  const [pathname, query] = req.url.split("?", 2);
  if (pathname !== "/" && pathname?.endsWith("/")) {
    req.url = pathname.slice(0, -1) + (query === undefined ? "" : `?${query}`);
  }
  return router(req, res);
});
