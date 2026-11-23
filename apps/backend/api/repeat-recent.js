import { repeatRecentRequests } from "../src/repeatRequests.js";

export default async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.send({ error: "Method Not Allowed" });
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers?.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.send({ error: "Unauthorized" });
      return;
    }
  }

  try {
    await repeatRecentRequests();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.send({ message: "Recent requests repeated successfully." });
  } catch (error) {
    console.error("Error repeating recent requests:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.send({ error: error.message || "Internal Server Error" });
  }
};
