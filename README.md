# Nodejs Slack DeepL Translator

* **Slack**에 **DeepL**과 **OpenAI** API를 연동해 번역봇으로 사용하기 위한 토이 프로젝트

## Overview

Nodejs를 기반으로 @slack/web-api과 openai 라이브러리를 이용해 제공되는 DeepL, OpenAI API로 채팅을 번역하는 Slack 번역 봇 서버입니다.

## 개발 환경

* **NodeJS:** `v20.16.0` (LTS)
* **PackageManager:** `npm`

## Getting Started

### 실행

```bash
# Module Install
npm install

# Server start
npm run start
```

### 환경변수

* **SLACK_BOT_TOKEN**: *OAuth & Permissions-OAuth Tokens*의 **Bot User OAuth Token**을 입력합니다.
* **DEEPL_API_KEY**: [DeepL API Key](https://www.deepl.com/en/your-account/keys)를 입력합니다.
* **OPENAI_API_KEY**: OpenAI API 키를 입력합니다.

```plaintext
SLACK_BOT_TOKEN=
DEEPL_API_KEY=
OPENAI_API_KEY=
```

### 배포 방법

* vercel-cli 사용을 위해 vercel 라이브러리를 전역에 설치하고 로그인합니다.

```bash
npm instal -g vercel

vercel login
```

* `vercel.json` 파일을 생성하고 다음과 같이 작성합니다.

```json
{
    "version": 2,
    "routes": [
      {
        "src": "/(.*)",
        "dest": "api/app.js"
      }
    ]
}
```

* 다음과 같은 vercel 명령을 통해 `production`에 배포합니다.

```bash
vercel --prod
```

### Slack에서 사용 방법

1. Slack 채널에 Bot을 추가합니다.
2. **@지정한봇명**과 **번역할 언어(ko, en)**, 번역될 **text**를 입력합니다.

```plaintext
예시)
@trans-bot en 안녕 세상아.
@trans-bot ko Hello, world.

또는

@trans-bot en
안녕 세상아.
@trans-bot ko
Hello, world.
```

![sample](/assets/sample.gif)

## Reference

* [https://api.slack.com/](https://api.slack.com/)
* [https://www.deepl.com/en/your-account/subscription](https://www.deepl.com/en/your-account/subscription)
* [https://velog.io/@devand/%EC%8A%AC%EB%9E%99-Web-API-%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%B4%EB%B3%B4%EC%9E%90-1](https://velog.io/@devand/%EC%8A%AC%EB%9E%99-Web-API-%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%B4%EB%B3%B4%EC%9E%90-1)