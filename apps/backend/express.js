import express from "express";

import router from "./router.js";

const app = express();

app.use(router);

const port = process.env.PORT || process.env.port || 9000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
