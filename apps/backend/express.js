import { app } from "./app.js";

const port = process.env.PORT || process.env.port || 80;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
