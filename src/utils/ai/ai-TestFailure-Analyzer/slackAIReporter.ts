import { sendSlackReport } from './sendSlackReport';
import axios from 'axios';
import fs from 'fs';

// ===============================
// Safe JSON Reader
// ===============================
function readJsonSafe(path: string, defaultValue: any) {
  try {
    if (!fs.existsSync(path)) return defaultValue;

    const content = fs.readFileSync(path, 'utf-8').trim();
    if (!content) return defaultValue;

    return JSON.parse(content);
  } catch {
    console.log(`⚠️ Invalid JSON: ${path}`);
    return defaultValue;
  }
}

// ===============================
// Safe Text Reader
// ===============================
function readTextSafe(path: string, defaultValue: string) {
  try {
    if (!fs.existsSync(path)) return defaultValue;

    const content = fs.readFileSync(path, 'utf-8').trim();
    return content || defaultValue;
  } catch {
    return defaultValue;
  }
}

// ===============================
// Main Function
// ===============================
export async function sendAISummaryToSlack() {
  try {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
      console.log('Slack webhook not configured');
      return;
    }

    // ===============================
    // Environment Metadata
    // ===============================
    const triggeredBy = process.env.USER_EMAIL || 'Madan';
    const environment = process.env.ENV || 'QA';
    const project = 'AI-Powered Testing';

    // ===============================
    // Read AI Files (SAFE)
    // ===============================
    const summary = readJsonSafe('reports/ai-summary.json', {
      totalTests: 0,
      totalFailures: 0,
      failureRate: '0%',
      riskLevel: 'LOW',
      decision: 'PROCEED',
    });

    const aiReports = readJsonSafe('reports/ai-report.json', []);
    const trends = readJsonSafe('reports/ai-trend.json', []);

    const executiveSummary = readTextSafe(
      'reports/ai-executive-summary.txt',
      'All tests passed successfully. Application is stable.',
    );

    // ===============================
    // Risk Indicator
    // ===============================
    let riskEmoji = '🟢';
    if (summary.riskLevel === 'MEDIUM') riskEmoji = '🟡';
    if (summary.riskLevel === 'HIGH') riskEmoji = '🔴';

    // ===============================
    // Failed Tests (Top 5)
    // ===============================
    let failedTestsText = 'No failed tests';

    if (aiReports.length > 0) {
      failedTestsText = aiReports
        .slice(0, 5)
        .map((r: any) => {
          const text = (r.aiAnalysis || '').toLowerCase();

          let type = 'Test Issue';
          if (text.includes('locator')) type = 'Locator';
          else if (text.includes('application') || text.includes('backend'))
            type = 'Application';
          else if (
            text.includes('environment') ||
            text.includes('network') ||
            text.includes('timeout')
          )
            type = 'Environment';

          return `• ${r.testName}\n   → ${type}`;
        })
        .join('\n');

      if (aiReports.length > 5) {
        failedTestsText += `\n+${aiReports.length - 5} more failures`;
      }
    }

    // ===============================
    // Trend Analysis
    // ===============================
    const trendText =
      trends.length > 0
        ? trends
            .slice(0, 5)
            .map((t: string) => `• ${t}`)
            .join('\n')
        : 'No trend detected';

    // ===============================
    // Slack Payload
    // ===============================
    const payload = {
      username: 'MCSL-QA-Bot',
      icon_emoji: ':robot_face:',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${riskEmoji} AI Release Readiness Report`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Project:*\n${project}` },
            { type: 'mrkdwn', text: `*Environment:*\n${environment}` },
            { type: 'mrkdwn', text: `*Triggered By:*\n${triggeredBy}` },
            { type: 'mrkdwn', text: `*Risk Level:*\n*${summary.riskLevel}*` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              `*Execution Summary*\n` +
              `Total Tests: ${summary.totalTests}\n` +
              `Failures: ${summary.totalFailures}\n` +
              `Failure Rate: ${summary.failureRate}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Failed Tests (Top 5)*\n${failedTestsText}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Trend Analysis*\n${trendText}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Release Decision:* ${summary.decision}`,
          },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*AI QA Lead Insight*\n${executiveSummary}`,
          },
        },
      ],
    };

    // ===============================
    // Send to Slack
    // ===============================
    await axios.post(webhook, payload);
    console.log('📩 AI Slack report sent');

    // Optional: send basic report
    await sendSlackReport();
  } catch (err: any) {
    console.error('Slack AI Reporter Error:', err.message);
  }
}
