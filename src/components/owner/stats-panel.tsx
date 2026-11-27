import { Eye, MessageCircle, Navigation, Phone } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type StatEvent, type StatRow, summarize } from "@/lib/stats";

const TILES: { event: StatEvent; label: string; icon: ReactNode }[] = [
	{ event: "view", label: "คนเปิดดูหน้าร้าน", icon: <Eye /> },
	{ event: "call", label: "กดโทร", icon: <Phone /> },
	{ event: "line", label: "กดแชท LINE", icon: <MessageCircle /> },
	{ event: "directions", label: "กดนำทาง", icon: <Navigation /> },
];

const thaiDay = (day: string) =>
	new Intl.DateTimeFormat("th-TH", {
		day: "numeric",
		month: "short",
		timeZone: "UTC",
	}).format(new Date(`${day}T00:00:00Z`));

function Delta({ now, before }: { now: number; before: number }) {
	if (!before)
		return <span className="text-xs text-muted-foreground">30 วันล่าสุด</span>;
	const pct = Math.round(((now - before) / before) * 100);
	return (
		<span className="text-xs text-muted-foreground">
			{pct >= 0 ? "เพิ่มขึ้น" : "ลดลง"} {Math.abs(pct)}% จาก 30 วันก่อนหน้า
		</span>
	);
}

export function StatsPanel({
	rows,
	today,
}: {
	rows: StatRow[];
	today: string;
}) {
	const { series, totals, prev } = summarize(rows, today);
	const [hover, setHover] = useState<number | null>(null);
	const max = Math.max(1, ...series.map((d) => d.view));
	const taps = totals.call + totals.line + totals.directions;

	return (
		<div className="grid gap-4">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				{TILES.map((t) => (
					<Card key={t.event} size="sm">
						<CardContent className="grid gap-1">
							<span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground [&_svg]:size-3.5">
								{t.icon}
								{t.label}
							</span>
							<span className="text-3xl font-bold tracking-tight tabular-nums">
								{totals[t.event].toLocaleString()}
							</span>
							<Delta now={totals[t.event]} before={prev[t.event]} />
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="font-semibold">คนเปิดดูหน้าร้าน รายวัน</CardTitle>
					<p className="text-sm text-muted-foreground">
						30 วันล่าสุด · ลูกค้ากดติดต่อร้านรวม {taps.toLocaleString()} ครั้ง
					</p>
				</CardHeader>
				<CardContent>
					<div className="relative">
						{hover !== null && (
							<div
								className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow"
								style={{ left: `${((hover + 0.5) / series.length) * 100}%` }}
							>
								{thaiDay(series[hover].day)}: {series[hover].view} ครั้ง
							</div>
						)}
						{/* full-height hit targets per day; the visible bar is the thin mark inside */}
						<div className="flex h-40 items-end border-b">
							{series.map((d, i) => (
								<button
									key={d.day}
									type="button"
									aria-label={`${thaiDay(d.day)}: ${d.view} ครั้ง`}
									onMouseEnter={() => setHover(i)}
									onMouseLeave={() => setHover(null)}
									onFocus={() => setHover(i)}
									onBlur={() => setHover(null)}
									className="flex h-full flex-1 items-end px-px outline-none focus-visible:bg-muted"
								>
									<span
										className={`block w-full rounded-t-[4px] ${hover === i ? "bg-neutral-900" : "bg-neutral-700"}`}
										style={{
											height: d.view
												? `${Math.max(3, (d.view / max) * 100)}%`
												: "0",
										}}
									/>
								</button>
							))}
						</div>
						<div className="mt-2 flex justify-between text-xs text-muted-foreground">
							<span>{thaiDay(series[0].day)}</span>
							<span>วันนี้</span>
						</div>
					</div>
					<details className="mt-4 text-sm">
						<summary className="cursor-pointer text-muted-foreground">
							ดูเป็นตาราง
						</summary>
						<table className="mt-3 w-full text-left tabular-nums">
							<thead className="text-xs text-muted-foreground">
								<tr>
									<th className="py-1 font-medium">วันที่</th>
									<th className="py-1 font-medium">เปิดดู</th>
									<th className="py-1 font-medium">โทร</th>
									<th className="py-1 font-medium">LINE</th>
									<th className="py-1 font-medium">นำทาง</th>
								</tr>
							</thead>
							<tbody>
								{[...series].reverse().map((d) => (
									<tr key={d.day} className="border-t">
										<td className="py-1">{thaiDay(d.day)}</td>
										<td className="py-1">{d.view}</td>
										<td className="py-1">{d.call}</td>
										<td className="py-1">{d.line}</td>
										<td className="py-1">{d.directions}</td>
									</tr>
								))}
							</tbody>
						</table>
					</details>
				</CardContent>
			</Card>
			<p className="text-xs text-muted-foreground">
				นับเฉพาะคนจริงที่เปิดหน้าร้าน (ไม่นับบอท) และไม่เก็บข้อมูลส่วนตัวของลูกค้า
			</p>
		</div>
	);
}
