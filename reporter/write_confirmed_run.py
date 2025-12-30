from influxdb_client import InfluxDBClient, Point, WriteOptions
from datetime import datetime, timezone

# client = InfluxDBClient(
#     url="http://localhost:8086",
#     token="grafana-token",
#     org="automation"
# )

client = InfluxDBClient(
    url="http://localhost:8086",
    token="automation-token",
    org="automation"
)

write_api = client.write_api(
    write_options=WriteOptions(batch_size=1)
)

point = (
    Point("playwright_runs")
    .tag("project", "payments-ui")
    .tag("environment", "staging")
    .tag("run_id", "run_confirmed_001")
    .field("total", 150)
    .field("passed", 140)
    .field("failed", 8)
    .field("skipped", 2)
    .field("duration_sec", 1120)
    .time(datetime.now(timezone.utc))
)

write_api.write(bucket="test_runs", record=point)

write_api.flush()
client.close()

print("CONFIRMED DATA WRITTEN CLEANLY")
