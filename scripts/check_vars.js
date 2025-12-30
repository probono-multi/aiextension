const { InfluxDB } = require('@influxdata/influxdb-client');
const url = process.env.INFLUX_URL || 'http://localhost:8086';
const token = process.env.INFLUX_TOKEN || 'automation-token';
const org = process.env.INFLUX_ORG || 'automation';

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

async function run() {
  const fluxRun = `from(bucket: "test_runs")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "playwright_runs")
  |> keep(columns: ["run_id"])
  |> group()
  |> distinct(column: "run_id")
  |> sort(columns: ["run_id"], desc: true)
  |> limit(n:20)`;

  console.log('--- run variable query ---');
  const runRows = await queryApi.collectRows(fluxRun);
  console.log('runRows:', runRows);
  const run = runRows.length ? runRows[runRows.length - 1]._value : null; // pick most recent (last in list)
  console.log('selected run:', run);

  const fluxScreenshot = `from(bucket: "test_runs")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "playwright_artifacts")
  |> filter(fn: (r) => r._field == "url")
  |> filter(fn: (r) => r.type == "screenshot")
  |> filter(fn: (r) => r.run_id == "${run}")
  |> last()
  |> keep(columns: ["_value"])
  |> distinct(column: "_value")
  |> limit(n:1)`;

  console.log('--- screenshot variable query (using selected run) ---');
  const scrRows = run ? await queryApi.collectRows(fluxScreenshot) : [];
  console.log('screenshotRows:', scrRows);
}

run().catch(err => { console.error('error', err); process.exit(1); });