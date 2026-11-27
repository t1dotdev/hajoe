import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { dailyStats } from "@/db/schema";
import { SLUG } from "@/lib/shop";
import { EVENTS } from "@/lib/stats";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|lighthouse/i;

// Counts a page view or a tap on call/LINE/directions. Sent with navigator.sendBeacon.
export const Route = createFileRoute("/api/hit")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const done = new Response(null, { status: 204 });
				if (BOT.test(request.headers.get("user-agent") ?? "")) return done;
				let body: { slug?: unknown; event?: unknown };
				try {
					body = JSON.parse(await request.text());
				} catch {
					return done;
				}
				const { slug, event } = body;
				if (typeof slug !== "string" || !SLUG.test(slug)) return done;
				if (
					typeof event !== "string" ||
					!(EVENTS as readonly string[]).includes(event)
				)
					return done;
				// shortcut: no rate limit; counts can be inflated by someone scripting requests
				try {
					const db = await getDb();
					await db
						.insert(dailyStats)
						.values({
							slug,
							event,
							day: sql`(now() at time zone 'Asia/Bangkok')::date`,
							count: 1,
						})
						.onConflictDoUpdate({
							target: [dailyStats.slug, dailyStats.day, dailyStats.event],
							set: { count: sql`${dailyStats.count} + 1` },
						});
				} catch {
					// unknown slug (FK) or DB hiccup: never break the visitor's page over a counter
				}
				return done;
			},
		},
	},
});
