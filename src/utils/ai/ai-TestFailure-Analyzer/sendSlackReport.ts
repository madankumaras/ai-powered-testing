import fs from 'fs';
import path from 'path';
import https from 'https';

export async function sendSlackReport(): Promise<void> {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.log('Slack bot token or channel not configured');
    return;
  }

  const filePath = path.join(process.cwd(), 'tests', 'smart-report.html');

  if (!fs.existsSync(filePath)) {
    console.log('Smart report not found, skipping upload');
    return;
  }

  try {
    const fileContent = fs.readFileSync(filePath);
    const fileSize = fileContent.length;

    /* ---------- Step 1: Get Upload URL ---------- */
    const uploadInfo: any = await new Promise((resolve, reject) => {
      const payload = `filename=smart-report.html&length=${fileSize}`;

      const options = {
        hostname: 'slack.com',
        path: '/api/files.getUploadURLExternal',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          const response = JSON.parse(data);
          if (response.ok) resolve(response);
          else reject(new Error(response.error));
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    /* ---------- Step 2: Upload File Content ---------- */
    await new Promise((resolve, reject) => {
      const url = new URL(uploadInfo.upload_url);

      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'text/html',
            'Content-Length': fileContent.length,
          },
        },
        res => {
          if (res.statusCode === 200) resolve(true);
          else reject(new Error(`Upload failed: ${res.statusCode}`));
        },
      );

      req.on('error', reject);
      req.write(fileContent);
      req.end();
    });

    /* ---------- Step 3: Complete Upload ---------- */
    await new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        files: [
          {
            id: uploadInfo.file_id,
            title: 'Smart Report',
          },
        ],
        channel_id: channelId,
        initial_comment: '📎 Smart HTML Report',
      });

      const options = {
        hostname: 'slack.com',
        path: '/api/files.completeUploadExternal',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          const response = JSON.parse(data);
          if (response.ok) resolve(true);
          else reject(new Error(response.error));
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    console.log('📎 Smart report uploaded to Slack successfully');
  } catch (error: any) {
    console.error('Slack file upload error:', error.message);
  }
}
