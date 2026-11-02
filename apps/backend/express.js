import { app } from "./app.js";

const port = process.env.PORT || process.env.port || 9000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 20_000).unref();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
