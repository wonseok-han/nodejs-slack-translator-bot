const express = require("express");
const bodyParser = require("body-parser");
const openaiHandler = require("../handlers/openaiHandler");
const deeplHandler = require("../handlers/deeplHandler");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// OpenAI 및 DeepL 핸들러 사용
app.use("/slack/openai", openaiHandler);
app.use("/slack/deepl", deeplHandler);

// 서버 실행
app.listen(3000, () => {
  console.log("Slack translator bot is running on port 3000");
});

module.exports = app;
