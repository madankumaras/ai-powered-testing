import fs from 'fs';

const HISTORY_FILE = 'reports/history.json';
const MAX_HISTORY = 10;

export type TestStatus =
  | 'passed'
  | 'failed'
  | 'timedOut'
  | 'skipped'
  | 'interrupted';

export function updateHistory(results: { name: string; status: TestStatus }[]) {
  const carrier = process.env.CARRIER || 'DEFAULT';

  let history: any = {};

  try {
    fs.mkdirSync('reports', { recursive: true });

    if (fs.existsSync(HISTORY_FILE)) {
      const content = fs.readFileSync(HISTORY_FILE, 'utf-8').trim();
      if (content) history = JSON.parse(content);
    }
  } catch {
    console.log('⚠️ Resetting history');
    history = {};
  }

  // Initialize carrier block
  if (!history[carrier]) {
    history[carrier] = {};
  }

  for (const test of results) {
    if (!history[carrier][test.name]) {
      history[carrier][test.name] = [];
    }

    history[carrier][test.name].push(test.status);

    if (history[carrier][test.name].length > MAX_HISTORY) {
      history[carrier][test.name].shift();
    }
  }

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export function analyzeTrends() {
  const carrier = process.env.CARRIER || 'DEFAULT';

  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];

    const content = fs.readFileSync(HISTORY_FILE, 'utf-8').trim();
    if (!content) return [];

    const history = JSON.parse(content);

    if (!history[carrier]) return [];

    const trends: string[] = [];

    for (const [testName, statuses] of Object.entries(history[carrier])) {
      if ((statuses as string[]).length < 2) continue;

      const last = (statuses as string[]).slice(-3);

      const allFailed = last.every(s => s !== 'passed');
      const hasMix = new Set(last).size > 1;

      if (allFailed) {
        trends.push(`${carrier} → ${testName} → Persistent Failure`);
      } else if (hasMix) {
        trends.push(`${carrier} → ${testName} → Flaky`);
      }
    }

    return trends;
  } catch {
    return [];
  }
}
