import assert from "node:assert/strict";
import { test } from "node:test";
import { bangkokDay, summarize } from "./stats.ts";

test("Bangkok day rolls over at midnight +07:00", () => {
	assert.equal(bangkokDay(new Date("2026-11-30T16:59:00Z")), "2026-11-30");
	assert.equal(bangkokDay(new Date("2026-11-30T17:00:00Z")), "2026-12-01");
});

test("summarize fills 30 days and splits current vs previous period", () => {
	const rows = [
		{ day: "2026-12-01", event: "view", count: 5 },
		{ day: "2026-12-01", event: "call", count: 2 },
		{ day: "2026-11-02", event: "view", count: 1 }, // first day of this period
		{ day: "2026-11-01", event: "view", count: 7 }, // previous period
		{ day: "2026-12-01", event: "bogus", count: 99 },
	];
	const s = summarize(rows, "2026-12-01");
	assert.equal(s.series.length, 30);
	assert.equal(s.series[0].day, "2026-11-02");
	assert.equal(s.series[29].day, "2026-12-01");
	assert.deepEqual(s.totals, { view: 6, call: 2, line: 0, directions: 0 });
	assert.deepEqual(s.prev, { view: 7, call: 0, line: 0, directions: 0 });
});
