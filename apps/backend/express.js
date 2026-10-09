import path from "path";
import { fileURLToPath } from "url";

import express from "express";

import router from "./router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.get("/", (req, res) => {
  res.redirect("/frontend/docs/");
});

app.use(
  "/frontend",
  express.static(path.join(__dirname, "../frontend/build"), {
    maxAge: "3600000",
  }),
);

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

const port = process.env.PORT || process.env.port || 80;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
