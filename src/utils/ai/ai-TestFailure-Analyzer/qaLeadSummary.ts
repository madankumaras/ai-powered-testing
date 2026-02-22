import { callOllama } from '../ollamaClient';

export async function generateQALeadSummary(summary: any): Promise<string> {
  const prompt = `
You are a Senior QA Lead reviewing an automated test execution.

Context:
- Framework: Playwright
- Language: TypeScript
- Test Type: End-to-End Automation

Execution Summary:
${JSON.stringify(summary, null, 2)}

Write a concise executive summary (5–6 lines):

Include:
- Overall stability based on failure rate
- Dominant failure category
- Risk interpretation
- Release recommendation aligned with:
  LOW → PROCEED
  MEDIUM → REVIEW
  HIGH → BLOCK
- Immediate action if needed

Tone: Executive, concise, professional.
No unnecessary technical details.
`;

  return await callOllama(prompt);
}
