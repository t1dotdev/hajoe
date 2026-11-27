export const EVENTS = ["view", "call", "line", "directions"] as const;
export type StatEvent = (typeof EVENTS)[number];
export type StatRow = { day: string; event: string; count: number };
export type Totals = Record<StatEvent, number>;

const zero = (): Totals => ({ view: 0, call: 0, line: 0, directions: 0 });

export const bangkokDay = (now: Date) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(now); // YYYY-MM-DD

const shift = (day: string, by: number) => {
	const d = new Date(`${day}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + by);
	return d.toISOString().slice(0, 10);
};

// Last `days` days (oldest first, today last) plus totals for this and the previous period
export function summarize(rows: StatRow[], today: string, days = 30) {
	const start = shift(today, -(days - 1));
	const prevStart = shift(today, -(2 * days - 1));
	const series = Array.from({ length: days }, (_, i) => ({
		day: shift(start, i),
		...zero(),
	}));
	const byDay = new Map(series.map((s) => [s.day, s]));
	const totals = zero();
	const prev = zero();
	for (const r of rows) {
		if (!(EVENTS as readonly string[]).includes(r.event)) continue;
		const e = r.event as StatEvent;
		const point = byDay.get(r.day);
		if (point) {
			point[e] += r.count;
			totals[e] += r.count;
		} else if (r.day >= prevStart && r.day < start) prev[e] += r.count;
	}
	return { series, totals, prev };
}
