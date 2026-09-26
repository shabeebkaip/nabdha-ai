import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateRows, parseCsvText } from "./dataset-parse";

test("aggregateRows sums revenue, counts distinct customers, derives growth + retention proxy", () => {
  const rows = [
    { OrderDate: "2024-01-05", Customer: "a@x.com", Revenue: "1000" },
    { OrderDate: "2024-01-20", Customer: "b@x.com", Revenue: "1200" },
    { OrderDate: "2024-02-10", Customer: "a@x.com", Revenue: "1500" },
    { OrderDate: "2024-02-25", Customer: "c@x.com", Revenue: "2000" },
    { OrderDate: "2024-03-05", Customer: "a@x.com", Revenue: "2500" },
    { OrderDate: "2024-03-20", Customer: "d@x.com", Revenue: "3000" },
  ];
  const m = aggregateRows(rows, "test.csv");
  assert.equal(m.rows, 6);
  assert.equal(m.revenue, 11200);
  assert.equal(m.customers, 4);
  assert.equal(m.avgOrderValue, Math.round(11200 / 6));
  assert.ok(typeof m.revenueGrowthPct === "number" && m.revenueGrowthPct > 0);
  assert.equal(m.retentionPct, Math.round((1 - 4 / 6) * 100));
});

test("aggregateRows handles no rows / no recognizable columns without throwing", () => {
  assert.deepEqual(aggregateRows([], "empty.csv"), { fileName: "empty.csv", rows: 0 });
  const m = aggregateRows([{ Foo: "1", Bar: "2" }], "unrecognized.csv");
  assert.equal(m.rows, 1);
  assert.equal(m.revenue, undefined);
});

test("parseCsvText survives a quoted field containing a comma", () => {
  const csvText = 'OrderDate,Customer,Revenue\n2024-01-05,"Doe, John",1000\n2024-01-06,jane@x.com,900\n';
  const parsed = parseCsvText(csvText);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0]!.Customer, "Doe, John");
});
