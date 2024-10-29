const express = require("express");
const { WebClient } = require("@slack/web-api");
const { COMMANDS } = require("../constants");

const OpenAI = require("openai");
require("dotenv").config();

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const slackClient = new WebClient(SLACK_TOKEN);
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const router = express.Router();

// Slack 메시지를 OpenAI로 처리하는 엔드포인트
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

      // ChatGPT API를 사용하여 메시지 번역
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

// ChatGPT 번역 함수
async function translateText(text, targetLang) {
  try {
    const prompt = `Translate the following text to ${targetLang}:\n\n"${text}"`;
    const response = await openai.chat.completions.create(
      {
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "gpt-3.5-turbo",
      },
      {
        maxRetries: 1,
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Translation error:", error);
    return `[Error!] ${text}`; // 오류 발생 시 원문을 그대로 반환
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
