import "dotenv/config";
import statsCard from "./api-renamed/index.js";
import repoCard from "./api-renamed/pin.js";
import langCard from "./api-renamed/top-langs.js";
import wakatimeCard from "./api-renamed/wakatime.js";
import gistCard from "./api-renamed/gist.js";
import express from "express";

const app = express();
const router = express.Router();

router.get("/", statsCard);
router.get("/pin", repoCard);
router.get("/top-langs", langCard);
router.get("/wakatime", wakatimeCard);
router.get("/gist", gistCard);

app.use("/api", router);

const port = process.env.PORT || process.env.port || 9000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
