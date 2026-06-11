import dotenv from "dotenv";
import app from "./app.js";
import env from "./config/env.js";

dotenv.config();

app.listen(env.PORT, () => {
  console.log(`Quorum API running on port ${env.PORT} [${env.NODE_ENV}]`);
});
