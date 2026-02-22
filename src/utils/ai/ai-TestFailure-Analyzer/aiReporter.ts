import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
  Suite,
} from '@playwright/test/reporter';
import type { TestStatus } from './trendAnalyzer';
import { analyzeFailure } from './failureAnalyzer';
import { calculateRisk } from './riskAnalyzer';
import { generateQALeadSummary } from './qaLeadSummary';
import { sendAISummaryToSlack } from './slackAIReporter';
import { updateHistory, analyzeTrends } from './trendAnalyzer';
import fs from 'fs';

export default class AIReporter implements Reporter {
  private failures: {
    testName: string;
    status: string;
    errorMessage: string;
  }[] = [];

  private aiReports: {
    testName: string;
    status: string;
    errorMessage: string;
    aiAnalysis: string;
    time: string;
  }[] = [];

  // Store ALL test results for trend analysis
  private runResults: { name: string; status: TestStatus }[] = [];

  private totalTests = 0;

  // ====================================================
  // Start
  // ====================================================
  onBegin(config: any, suite: Suite) {
    this.totalTests = suite.allTests().length;
    console.log('🚀 AIReporter started');
    console.log(`Total tests in run: ${this.totalTests}`);
  }

  // ====================================================
  // Collect results
  // ====================================================
  onTestEnd(test: TestCase, result: TestResult) {
    // Store every test result (for trend)
    this.runResults.push({
      name: test.title,
      status: result.status,
    });

    // Collect failures only
    if (result.status === 'passed' || result.status === 'skipped') return;

    this.failures.push({
      testName: test.title,
      status: result.status,
      errorMessage: result.error?.message || 'No error message',
    });
  }

  // ====================================================
  // End
  // ====================================================
  async onEnd(result: FullResult) {
    console.log(`Total failures: ${this.failures.length}`);

    try {
      fs.mkdirSync('reports', { recursive: true });

      // ====================================================
      // STEP 1 — Update history (for trend tracking)
      // ====================================================
      updateHistory(this.runResults);

      const trends = analyzeTrends();

      fs.writeFileSync(
        'reports/ai-trend.json',
        JSON.stringify(trends, null, 2),
      );

      console.log('📈 Trend analysis generated');

      // ====================================================
      // CASE 1: No failures
      // ====================================================
      if (this.failures.length === 0) {
        const summary = {
          totalTests: this.totalTests,
          totalFailures: 0,
          failureRate: '0%',
          locatorIssues: 0,
          applicationIssues: 0,
          environmentIssues: 0,
          testIssues: 0,
          timeoutFailures: 0,
          riskLevel: 'LOW',
          decision: 'PROCEED',
          reason: 'All tests passed successfully',
        };

        fs.writeFileSync(
          'reports/ai-summary.json',
          JSON.stringify(summary, null, 2),
        );

        const executiveSummary =
          'All tests passed successfully. Application is stable and safe for release.';

        fs.writeFileSync(
          'reports/ai-executive-summary.txt',
          executiveSummary,
        );

        //console.log('📩 Sending AI summary to Slack...');
        await sendAISummaryToSlack();

        console.log('✅ No failures. LOW risk.');
        return;
      }

      // ====================================================
      // CASE 2: Failures present
      // ====================================================

      // -------- AI per failure --------
      for (const failure of this.failures) {
        console.log('\n===== AI FAILURE ANALYSIS =====');
        console.log(`Test: ${failure.testName}`);

        const aiResponse = await analyzeFailure(
          failure.testName,
          failure.errorMessage,
        );

        console.log(aiResponse);
        console.log('===== END AI ANALYSIS =====\n');

        this.aiReports.push({
          testName: failure.testName,
          status: failure.status,
          errorMessage: failure.errorMessage,
          aiAnalysis: aiResponse,
          time: new Date().toISOString(),
        });
      }

      // -------- Write detailed AI report --------
      fs.writeFileSync(
        'reports/ai-report.json',
        JSON.stringify(this.aiReports, null, 2),
      );

      console.log('📄 AI report generated');

      // -------- Calculate execution risk --------
      const summary = calculateRisk(this.aiReports, this.totalTests);

      console.log('\n===== AI EXECUTION SUMMARY =====');
      console.log(summary);
      console.log('================================\n');

      fs.writeFileSync(
        'reports/ai-summary.json',
        JSON.stringify(summary, null, 2),
      );

      console.log('📄 AI summary generated');

      // -------- QA Lead Executive Summary --------
      const executiveSummary = await generateQALeadSummary(summary);

      fs.writeFileSync(
        'reports/ai-executive-summary.txt',
        executiveSummary,
      );

      console.log('📄 AI executive summary generated');

      // -------- Send Slack AFTER all files ready --------
      // console.log('📩 Sending AI summary to Slack...');
      await sendAISummaryToSlack();

      // -------- Block CI if HIGH risk --------
      if (summary.riskLevel === 'HIGH') {
        console.error('🚨 AI BLOCKED RELEASE (HIGH RISK)');
        process.exitCode = 1;
      }
    } catch (error) {
      console.error('❌ AI Reporter Error:', error);
    }
  }
}
