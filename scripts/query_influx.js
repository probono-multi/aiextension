const { InfluxDB } = require('@influxdata/influxdb-client');

const url = process.env.INFLUX_URL || 'http://localhost:8086';
const token = process.env.INFLUX_TOKEN || 'automation-token';
const org = process.env.INFLUX_ORG || 'automation';

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

const flux = `from(bucket: "test_runs")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "playwright_runs")
  |> filter(fn: (r) => r._field == "artifacts")
  |> last()`;

console.log('Running Flux query:\n', flux);

queryApi.collectRows(flux)
  .then(rows => {
    console.log('Query returned', rows.length, 'rows');
    for (const r of rows) {
      console.log(JSON.stringify(r, null, 2));
    }
  })
  .catch(err => {
    console.error('Query error', err);
  });
