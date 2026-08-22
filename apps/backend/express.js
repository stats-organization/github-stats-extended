import express from "express";

import router from "./router.js";

const app = express();

app.use((req, res) => {
  /*
   * Vercel resolves `/api/pin/` to the same function as `/api/pin`, but the router matches the path exactly.
   * Drop the trailing slash so local requests behave like deployed ones.
   */
  const [pathname, query] = req.url.split("?", 2);
  if (pathname !== "/" && pathname?.endsWith("/")) {
    req.url = pathname.slice(0, -1) + (query === undefined ? "" : `?${query}`);
  }
  return router(req, res);
});

const port = process.env.PORT || process.env.port || 9000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
