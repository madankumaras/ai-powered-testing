import { callOllama } from '../ollamaClient';

export async function analyzeFailure(
  testName: string,
  errorMessage: string,
): Promise<string> {
  const prompt = `
You are a Senior Playwright QA Engineer.

Context:
- Framework: Playwright
- Language: TypeScript
- Test Type: End-to-End UI Automation

Analyze the following Playwright test failure and give suggestions specifically for Playwright + TypeScript.

Provide the output in this format:

Root Cause:
Failure Type (Locator / Application Bug / Network / Environment / Test Issue):
Suggested Fix (Playwright specific):
Severity (Low / Medium / High):

Guidelines:
- Suggest Playwright best practices (getByRole, getByTestId, waitFor, expect, retries, etc.)
- Do NOT mention Selenium or other tools
- Keep the response short and actionable

Test Name:
${testName}

Error:
${errorMessage}
`;

  return await callOllama(prompt);
}
