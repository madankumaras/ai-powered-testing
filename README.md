<h1 align="center">🤖 AI-Powered Playwright Automation Framework</h1>

<p align="center">
  <strong>Next-Generation UI Testing Pipeline with Local LLM Failure Analysis & Intelligent Slack Reporting</strong>
</p>

<p align="center">
  <img alt="Playwright" src="https://img.shields.io/badge/-Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Ollama" src="https://img.shields.io/badge/-Ollama%20(Local%20LLM)-white?style=flat-square&logo=ollama&logoColor=black" />
  <img alt="Slack" src="https://img.shields.io/badge/-Slack%20Integrations-4A154B?style=flat-square&logo=slack&logoColor=white" />
</p>

---

## 🌟 Overview

This repository showcases an **Enterprise-Grade E2E Test Automation Framework** built from the ground up using **Playwright** and **TypeScript**.

Beyond standard UI validations using the scalable **Page Object Model (POM)** architecture, this framework features a custom-built **AI Test Failure Analyzer**. Whenever a test fails, the framework intercepts the error, feeds the DOM context and stack trace into a local LLM (Ollama/Qwen), and automatically generates a root-cause analysis, a suggested Playwright-specific fix, and a release risk assessment right inside your Slack channel.

It is designed to drastically reduce triage time and empower QA teams to ship faster with extreme confidence.

---

## 🚀 Key Features

- **Intelligent AI Failure Analysis:** Uses a massive 14-Billion parameter local LLM (`qwen2.5:14b`) running via Ollama to automatically classify test failures (Locator vs. Application vs. Environment) and provide actionable code snippets to fix the test.
- **Executive Risk Assessment:** The AI calculates an automated **Deployment Risk Score** (LOW, MEDIUM, HIGH) based on the aggregate failure patterns and blocks pipelines accordingly.
- **Custom Slack Dashboards:** Dynamically posts rich, customized Block Kit notifications to Slack channels with dynamic Test Durations, Trigger Context, AI Summaries, and Top failures—omitting verbose logs.
- **Playwright Smart Reporter:** Automatically injects an interactive HTML report of the test run directly into the Slack thread via the Slack Web API.
- **Robust Architecture:** Fully implements the **Page Object Model** and environment-segregated configuration strategies (e.g., `config/qa.env`).
- **Zero Data Leakage:** Because the AI inferences run on local LLMs (`Ollama`), proprietary DOM elements and test data never leave the company's internal network.

---

## 🏗 Framework Architecture

The framework is strictly categorized for scalability and long-term maintenance:

```text
├── config/
│   └── qa.env                  # Environment-specific public configs (URLs, endpoints)
├── src/
│   ├── components/             # Reusable UI fragments (Header, Footer, ProductCards)
│   ├── fixtures/               # Playwright custom fixtures (Auto-instantiates POMs)
│   ├── pages/                  # Page Object Models for core application screens
│   └── utils/
│       ├── ai/                 # 🧠 Core AI execution & analysis pipeline
│       │   └── ai-TestFailure-Analyzer/
│       │       ├── aiReporter.ts       # Custom Playwright Reporter hook
│       │       ├── failureAnalyzer.ts  # Interfaces with Ollama for Root Cause Analysis
│       │       ├── riskAnalyzer.ts     # Aggregates failure types to determine Release Risk
│       │       └── slackAIReporter.ts  # Formats analysis into Slack Block Kit
│       └── slackCustomLayout.ts# Conventional standard test execution layout
├── tests/
│   ├── e2e/                    # End-to-End automated user flows
│   └── api/                    # (Expandable) API validation tests
├── test-data/                  # JSON files driving data-provider tests
└── playwright.config.ts        # Central configuration (Retries, Workers, Reporters)
```

---

## 🧠 How the AI Failure Pipeline Works

1.  **Intercept (`onTestEnd`)**: The custom `AIReporter` captures the failure trace.
2.  **Inference (`callOllama`)**: The error is piped to a local LLM prompt strictly bound by the context of a Sr. Playwright QA Engineer.
3.  **Risk Profiling (`analyzeTrends`)**: Comparing historical test flakiness stored locally, the system decides if the failure is a known flaky test or a new regression.
4.  **Executive Summary (`sendAISummaryToSlack`)**: The AI drafts a 5-line executive summary indicating if the release should PROCEED, be REVIEWED, or be BLOCKED, and pushes it directly to Slack.

---

## ⚙️ Setup & Installation

### 1. Prerequisites

- **Node.js** (v18+)
- **Ollama** installed locally (https://ollama.com/) with the Qwen model pulled:
  ```bash
  ollama run qwen2.5:14b
  ```

### 2. Clone and Install

```bash
git clone https://github.com/madankumaras/ai-powered-testing.git
cd ai-powered-testing
npm install
npx playwright install --with-deps
```

### 3. Environment Configuration

Duplicate the `.env` template to safely store your secrets.

```bash
touch .env
```

Populate `.env` with your Slack credentials and Ollama configuration:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_BOT_USER_OAUTH_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C0...
OLLAMA_MODEL=qwen2.5:14b
OLLAMA_URL=http://127.0.0.1:11434/api/generate
```

_(Your `.env` file is heavily protected via `.gitignore` to prevent credential leaks)._

---

## 🧪 Running the Tests

**1. Run tests across all major browsers (Headless):**

```bash
npx playwright test
```

**2. Watch the execution locally (Headed UI Mode):**

```bash
npx playwright test --ui
```

**3. Trigger the AI Analyzer specifically (Force Failures):**

```bash
npx playwright test tests/e2e/failing.spec.ts --project="Google Chrome"
```

_(You will see the AI root-cause analysis dynamically render in the terminal and push an interactive webhook payload to your Slack workspace!)_

---

### 👨‍💻 About the Author

Built by a passionate Quality Engineering specialist focused on shifting QA to the left by integrating Generative AI into modern UI automation frameworks. Always seeking to build out-of-the-box infrastructure that elevates software delivery pipelines to the next level.
