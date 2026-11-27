import {
	date,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import type { ShopData } from "../lib/shop.ts";

export const shops = pgTable("shops", {
	slug: text("slug").primaryKey(),
	data: jsonb("data").$type<ShopData>().notNull(),
	// sha256 of the owner's secret link token; the token itself is never stored
	ownerTokenHash: text("owner_token_hash").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// One counter per shop, Bangkok day and event. No IPs, cookies or visitor IDs are stored.
export const dailyStats = pgTable(
	"daily_stats",
	{
		slug: text("slug")
			.notNull()
			.references(() => shops.slug, { onDelete: "cascade" }),
		day: date("day").notNull(),
		event: text("event").notNull(),
		count: integer("count").notNull().default(0),
	},
	(t) => [primaryKey({ columns: [t.slug, t.day, t.event] })],
);
