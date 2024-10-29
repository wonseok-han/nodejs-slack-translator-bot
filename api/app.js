const express = require("express");
const { WebClient } = require("@slack/web-api");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const COMMANDS = ["en", "ko"];

const app = express();
app.use(bodyParser.json());

const slackToken = process.env.SLACK_BOT_TOKEN;
const deepLApiKey = process.env.DEEPL_API_KEY;

const slackClient = new WebClient(slackToken);

// Slack 메시지를 처리하는 엔드포인트
app.post("/slack/events", async (req, res) => {
  console.log("Received Slack event:", req.body);

  const { type, event, challenge } = req.body;

  // Slack이 보낸 URL 검증용 challenge 요청을 처리
  if (type === "url_verification") {
    console.log("Received challenge request");
    return res.status(200).send(challenge);
  }

  // 메시지 이벤트가 발생한 경우
  const userMessage = event.text;
  // 명령어와 본문 분리
  const [userId, command, ...messageParts] = userMessage.split(/\s+/);

  if (
    (type === "event_callback" &&
      event.type === "app_mention" &&
      COMMANDS.includes((command || "").toLowerCase()),
    messageParts)
  ) {
    console.log("Processing message event:", event);

    console.log("User message received:", userMessage);

    const originalText = messageParts.join(" ").trim();

    console.log("User is...:", userId);
    console.log("Command is...:", command);

    if (command && originalText) {
      let targetLang;

      // 언어 코드에 따라 번역 방향 설정
      if (command.toLowerCase() === "en") {
        targetLang = "EN"; // 영어로 번역
      } else if (command.toLowerCase() === "ko") {
        targetLang = "KO"; // 한국어로 번역
      } else {
        console.log("Unsupported command:", command);
        return res.status(200).send();
      }

      // DeepL API를 사용하여 메시지 번역
      const detectedLanguage = detectLanguage(originalText);
      console.log("Detected language:", detectedLanguage);

      if (detectedLanguage === targetLang) {
        console.log("Original and target languages are the same.");
        await sendMessageToSlack(
          event.channel,
          `원문과 번역 언어가 동일합니다: ${originalText}`
        );
      } else {
        try {
          const translatedMessage = await translateText(
            originalText,
            detectedLanguage,
            targetLang
          );
          console.log("Translated message:", translatedMessage);

          // 원문과 번역된 메시지를 함께 Slack으로 전송
          const responseMessage = `(${targetLang}): ${translatedMessage}`;
          await sendMessageToSlack(event.channel, responseMessage);
        } catch (error) {
          console.error("Translation failed:", error);
        }
      }
    }

    res.status(200).send(); // Slack에 정상 처리되었음을 알림
  } else {
    res.status(200).send();
  }
});

// 언어 감지 함수 (간단히 영어/한국어 여부만 판단)
function detectLanguage(text) {
  const koreanRegex = /[가-힣]/;
  if (koreanRegex.test(text)) {
    return "KO"; // 한글이 포함된 경우 한국어로 판단
  }
  return "EN"; // 기본적으로 영어로 판단
}

// DeepL 번역 함수
async function translateText(text, sourceLang, targetLang) {
  try {
    const response = await axios({
      method: "post",
      url: "https://api-free.deepl.com/v2/translate",
      headers: {
        Authorization: `DeepL-Auth-Key ${deepLApiKey}`,
      },
      data: {
        text: [text],
        source_lang: sourceLang,
        target_lang: targetLang,
      },
    });

    return response.data.translations[0].text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // 오류 발생 시 원문을 그대로 반환
  }
}

// Slack에 메시지 보내기 함수 (@slack/web-api 사용)
async function sendMessageToSlack(channel, message) {
  try {
    await slackClient.chat.postMessage({
      channel: channel,
      text: message,
    });
  } catch (error) {
    console.error("Slack API error:", error);
  }
}

// 서버 실행
app.listen(3000, () => {
  console.log("Slack DeepL translator bot is running on port 3000");
});

module.exports = app;
