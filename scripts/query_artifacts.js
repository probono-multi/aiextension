const { InfluxDB } = require('@influxdata/influxdb-client');
const client = new InfluxDB({ url: process.env.INFLUX_URL || 'http://localhost:8086', token: process.env.INFLUX_TOKEN || 'automation-token' });
const queryApi = client.getQueryApi(process.env.INFLUX_ORG || 'automation');

const runId = process.argv[2] || process.env.RUN_ID || '2025-12-29T19-15-21-341Z';
const flux = `from(bucket: "test_runs")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "playwright_artifacts")
  |> filter(fn: (r) => r._field == "url")
  |> filter(fn: (r) => r.run_id == "${runId}")`

console.log('Running Flux:\n', flux);

queryApi.collectRows(flux)
  .then(rows => {
    console.log('Found', rows.length, 'artifact rows');
    for (const r of rows) {
      console.log('-', r._value);
    }
  })
  .catch(err => console.error('Query error', err));
