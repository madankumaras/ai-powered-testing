export function calculateRisk(
  aiReports: {
    testName: string;
    status: string;
    errorMessage: string;
    aiAnalysis: string;
  }[],
  totalTests: number,
) {
  let locator = 0;
  let app = 0;
  let env = 0;
  let testIssue = 0;
  let timeoutCount = 0;

  for (const report of aiReports) {
    const text = report.aiAnalysis.toLowerCase();
    const error = report.errorMessage.toLowerCase();

    // Category detection
    if (text.includes('locator') || text.includes('selector')) {
      locator++;
    } else if (
      text.includes('application') ||
      text.includes('backend') ||
      text.includes('server') ||
      text.includes('api') ||
      text.includes('data mismatch')
    ) {
      app++;
    } else if (
      text.includes('environment') ||
      text.includes('network') ||
      text.includes('infra') ||
      text.includes('configuration')
    ) {
      env++;
    } else {
      testIssue++;
    }

    // Timeout detection
    if (
      report.status === 'timedOut' ||
      error.includes('timeout') ||
      error.includes('timed out')
    ) {
      timeoutCount++;
    }
  }

  const totalFailures = aiReports.length;

  const failureRate = totalTests === 0 ? 0 : (totalFailures / totalTests) * 100;

  let riskLevel = 'LOW';
  let decision = 'PROCEED';
  let reason = 'Minor test instability';

  // ---------- HIGH RISK ----------
  if (app > 0) {
    riskLevel = 'HIGH';
    decision = 'BLOCK RELEASE';
    reason = 'Application defects detected';
  } else if (env > 0) {
    riskLevel = 'HIGH';
    decision = 'BLOCK RELEASE';
    reason = 'Environment/Infrastructure instability';
  } else if (timeoutCount >= 2) {
    riskLevel = 'HIGH';
    decision = 'BLOCK RELEASE';
    reason = 'Multiple timeouts detected';
  } else if (failureRate > 30) {
    riskLevel = 'HIGH';
    decision = 'BLOCK RELEASE';
    reason = 'High failure rate';
  }

  // ---------- MEDIUM RISK ----------
  else if (locator >= 3) {
    riskLevel = 'MEDIUM';
    decision = 'REVIEW';
    reason = 'Multiple locator issues (UI instability)';
  } else if (failureRate > 10) {
    riskLevel = 'MEDIUM';
    decision = 'REVIEW';
    reason = 'Moderate failure rate';
  }

  return {
    totalTests,
    totalFailures,
    failureRate: `${failureRate.toFixed(1)}%`,
    locatorIssues: locator,
    applicationIssues: app,
    environmentIssues: env,
    testIssues: testIssue,
    timeoutFailures: timeoutCount,
    riskLevel,
    decision,
    reason,
  };
}
