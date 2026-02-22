import { Block, KnownBlock } from '@slack/types';
import { SummaryResults } from 'playwright-slack-report/dist/src';

export function generateCustomLayout(
    summaryResults: SummaryResults,
): Array<KnownBlock | Block> {
    const { tests } = summaryResults;
    const meta = summaryResults.meta || [];

    // Extract custom meta variables
    const triggeredBy = process.env.TRIGGERED_BY || 'Madan Kumar AS';
    const appName = process.env.APP_NAME || 'Saucedemo App';
    const appUrl = process.env.BASE_URL || 'https://www.saucedemo.com';

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    let totalDurationMs = 0;

    tests.forEach((t) => {
        totalTests++;
        if (t.status === 'passed') passedTests++;
        if (t.status === 'failed') failedTests++;
        if (t.status === 'skipped') skippedTests++;

        try {
            const start = new Date(t.startedAt).getTime();
            const end = new Date(t.endedAt).getTime();
            totalDurationMs += (end - start);
        } catch (e) {
            // fallback if date parsing fails
        }
    });

    const headerBlock = {
        type: 'header',
        text: {
            type: 'plain_text',
            text: `@here Automation Test Report for ${appName} 🏃🏽‍♂️`,
            emoji: true,
        },
    };

    const summaryBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `SUMMARY: ${passedTests} passed | ${failedTests} failed | ${skippedTests} skipped | Total: ${totalTests}`,
        },
    };

    const infoBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `App URL: ${appUrl}\nAPP: ${appName}\nTriggered BY: ${triggeredBy}`,
        },
    };

    const dividerBlock = {
        type: 'divider',
    };

    // Creating blocks for individual test results
    const testBlocks = tests.map((t) => {
        const icon = t.status === 'passed' ? '✓' : '✖';
        return {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `\`${icon} ${t.name}\``,
            },
        };
    });

    const footerBlock = {
        type: 'context',
        elements: [
            {
                type: 'mrkdwn',
                text: `_${appName} Automation | Time taken: ${(totalDurationMs / 1000).toFixed(1)}s | ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}_`,
            },
        ],
    };

    return [
        headerBlock,
        summaryBlock,
        infoBlock,
        dividerBlock,
        ...testBlocks,
        dividerBlock,
        footerBlock,
    ] as Array<KnownBlock | Block>;
}
