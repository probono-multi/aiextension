from influxdb_client import InfluxDBClient, Point
from datetime import datetime
import os

client = InfluxDBClient(
    url="http://localhost:8086",
    token="automation-token",
    org="automation"
)

write_api = client.write_api()

point = (
    Point("playwright_runs")
    .tag("project", os.getenv("PROJECT", "sample-project"))
    .tag("environment", os.getenv("ENV", "local"))
    .tag("run_id", os.getenv("RUN_ID"))
    .field("total", int(os.getenv("TOTAL")))
    .field("passed", int(os.getenv("PASSED")))
    .field("failed", int(os.getenv("FAILED")))
    .field("skipped", int(os.getenv("SKIPPED")))
    .field("duration_sec", float(os.getenv("DURATION")))
    .time(datetime.utcnow())
)

write_api.write(bucket="test_runs", record=point)
