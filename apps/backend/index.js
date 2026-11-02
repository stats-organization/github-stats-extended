import express from "express";
import router from "./router.js";

const app = express();

app.use((req, res) => {
  const [pathname, query] = req.url.split("?", 2);

  if (pathname !== "/" && pathname?.endsWith("/")) {
    req.url =
      pathname.slice(0, -1) +
      (query === undefined ? "" : `?${query}`);
  }

  return router(req, res);
});

export default app;export { default as router } from "./router.js";
