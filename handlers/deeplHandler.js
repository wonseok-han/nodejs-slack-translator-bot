const express = require("express");
const { WebClient } = require("@slack/web-api");
const { COMMANDS } = require("../constants");

require("dotenv").config();

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;

const slackClient = new WebClient(SLACK_TOKEN);
const router = express.Router();

// Slack 메시지를 DeepL로 처리하는 엔드포인트
router.post("/events", async (req, res) => {
  console.log("Received Slack event:", req.body);

  const { type, event, challenge } = req.body;

  // Slack이 보낸 URL 검증용 challenge 요청을 처리
  if (type === "url_verification") {
    console.log("Received challenge request");
    return res.status(200).send(challenge);
  }

  // 메시지 이벤트가 발생한 경우
  if (type === "event_callback" && event.type === "app_mention") {
    const userMessage = event.text;
    const [userId, command, ...messageParts] = userMessage.split(/\s+/);

    console.log("User ID:", userId);
    console.log("Command:", command);

    if (COMMANDS.includes(command.toLowerCase())) {
      const originalText = messageParts.join(" ").trim();
      console.log("User message received:", userMessage);

      let targetLang;
      if (command.toLowerCase() === "en") {
        targetLang = "English";
      } else if (command.toLowerCase() === "ko") {
        targetLang = "Korean";
      } else {
        return res.status(200).send();
      }

      // DeepL API를 사용하여 메시지 번역
      try {
        const translatedMessage = await translateText(originalText, targetLang);
        console.log("Translated message:", translatedMessage);

        // 번역된 메시지를 Slack으로 전송
        const responseMessage = `(${targetLang}): ${translatedMessage}`;
        await sendMessageToSlack(event.channel, responseMessage);
      } catch (error) {
        console.error("Translation failed:", error);
      }
    }
    return res.status(200).send();
  } else {
    res.status(200).send();
  }
});

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

// Slack에 메시지 보내기 함수
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

module.exports = router;
