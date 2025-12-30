import fs from 'fs-extra';
import path from 'path';
import type {
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
  Reporter
} from '@playwright/test/reporter';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

export default class InfluxReporter implements Reporter {
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private total = 0;
  private startTime = 0;

  private runId!: string;
  private artifactDir!: string;
  private playwrightOutput = 'test-results';
  private artifactServerUrl = 'http://localhost:9090';

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.runId = new Date().toISOString().replace(/[:.]/g, '-');

    this.artifactDir = path.join(
      process.cwd(),
      'artifacts',
      'runs',
      this.runId
    );

    fs.ensureDirSync(this.artifactDir);

    console.log(`>>> Run ID: ${this.runId}`);
    console.log(`>>> Artifact dir: ${this.artifactDir}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.total++;
    if (result.status === 'passed') this.passed++;
    else if (result.status === 'failed') this.failed++;
    else this.skipped++;
  }

  async onEnd(result: FullResult) {
    console.log('>>> InfluxReporter onEnd invoked');

    const durationSec = Math.round((Date.now() - this.startTime) / 1000);

    // 1️⃣ Move Playwright artifacts
    const sourceDir = path.join(process.cwd(), this.playwrightOutput);
    if (fs.existsSync(sourceDir)) {
      fs.moveSync(sourceDir, this.artifactDir, { overwrite: true });
    }

    // 2️⃣ Connect to InfluxDB
    const client = new InfluxDB({
      url: process.env.INFLUX_URL || 'http://localhost:8086',
      token: process.env.INFLUX_TOKEN || 'automation-token'
    });

    const writeApi = client.getWriteApi(
      process.env.INFLUX_ORG || 'automation',
      process.env.INFLUX_BUCKET || 'test_runs'
    );

    // 3️⃣ Write run metrics
    const runPoint = new Point('playwright_runs')
      .tag('project', process.env.PROJECT_NAME || 'playwright-project')
      .tag('environment', process.env.TEST_ENV || 'local')
      .tag('run_id', this.runId)
      .intField('total', this.total)
      .intField('passed', this.passed)
      .intField('failed', this.failed)
      .intField('skipped', this.skipped)
      .intField('duration_sec', durationSec);

    writeApi.writePoint(runPoint);

    // 4️⃣ Index artifacts
    const files = fs
      .readdirSync(this.artifactDir, { recursive: true })
      .map(f => path.join(this.artifactDir, f as string))
      .filter(f => fs.statSync(f).isFile());

    let idx = 0;
    for (const f of files) {
      let type: 'screenshot' | 'video' | 'trace' | null = null;

      if (f.match(/\.(png|jpg|jpeg)$/i)) type = 'screenshot';
      else if (f.match(/\.(webm|mp4)$/i)) type = 'video';
      else if (f.match(/\.(zip|trace)$/i)) type = 'trace';

      if (!type) continue;

      const rel = path.relative(this.artifactDir, f).split(path.sep).join('/');
      const url = `${this.artifactServerUrl}/artifacts/runs/${this.runId}/${rel}`;

      const artifactPoint = new Point('playwright_artifacts')
        .tag('project', process.env.PROJECT_NAME || 'playwright-project')
        .tag('environment', process.env.TEST_ENV || 'local')
        .tag('run_id', this.runId)
        .tag('type', type)
        .intField('index', idx++)
        .stringField('url', url);

      writeApi.writePoint(artifactPoint);
    }

    await writeApi.flush();
    writeApi.close();

    console.log(`>>> Published run ${this.runId} with ${idx} artifacts`);
  }
}
