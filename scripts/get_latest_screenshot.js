const { InfluxDB } = require('@influxdata/influxdb-client');
const client = new InfluxDB({ url: process.env.INFLUX_URL || 'http://localhost:8086', token: process.env.INFLUX_TOKEN || 'automation-token' });
const queryApi = client.getQueryApi(process.env.INFLUX_ORG || 'automation');

const flux = `from(bucket: "test_runs")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "playwright_artifacts")
  |> filter(fn: (r) => r._field == "url")
  |> filter(fn: (r) => r.type == "screenshot")
  |> last()
  |> keep(columns: ["_value"])`;

queryApi.collectRows(flux)
  .then(rows => {
    console.log('rows:', rows);
    if (rows.length) console.log('latest screenshot url:', rows[0]._value);
  })
  .catch(err => console.error('query error', err));
