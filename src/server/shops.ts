import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { dailyStats, shops } from "@/db/schema";
import { cleanShop, SLUG, shopErrors } from "@/lib/shop";
import { bangkokDay } from "@/lib/stats";
import { hashToken, isAdmin, newToken, tokenMatches } from "./token.ts";

const asSlug = (v: unknown) => {
	if (typeof v !== "string" || !SLUG.test(v)) throw new Error("bad slug");
	return v;
};

async function shopRow(slug: string) {
	const db = await getDb();
	const [row] = await db.select().from(shops).where(eq(shops.slug, slug));
	return row;
}

async function ownerRow(slug: string, k: unknown) {
	const row = await shopRow(slug);
	if (!row || !tokenMatches(k, row.ownerTokenHash))
		throw new Error("ลิงก์นี้ใช้ไม่ได้ ขอลิงก์ใหม่จากหาเจอทาง LINE");
	return row;
}

// Page loaders return this instead of throwing, so the page renders its friendly message with a 403
// (a thrown error would make the SSR response a 500)
const forbidden = () => {
	setResponseStatus(403);
	return { ok: false as const };
};

export const getShop = createServerFn({ method: "GET" })
	.validator((slug: string) => asSlug(slug))
	.handler(async ({ data: slug }) => (await shopRow(slug))?.data ?? null);

type OwnerInput = { slug: string; k: string };
const ownerInput = (d: OwnerInput) => ({
	slug: asSlug(d?.slug),
	k: String(d?.k ?? ""),
});

export const getOwnerDashboard = createServerFn({ method: "POST" })
	.validator((d: OwnerInput) => ({
		slug: String(d?.slug ?? ""),
		k: String(d?.k ?? ""),
	}))
	.handler(async ({ data }) => {
		if (!SLUG.test(data.slug)) return forbidden();
		const row = await shopRow(data.slug);
		if (!row || !tokenMatches(data.k, row.ownerTokenHash)) return forbidden();
		const db = await getDb();
		const today = bangkokDay(new Date());
		const rows = await db
			.select({
				day: sql<string>`${dailyStats.day}::text`,
				event: dailyStats.event,
				count: dailyStats.count,
			})
			.from(dailyStats)
			.where(
				and(
					eq(dailyStats.slug, data.slug),
					gte(dailyStats.day, sql`${today}::date - 59`),
				),
			);
		return {
			ok: true as const,
			shop: row.data,
			rows,
			today,
			updatedAt: row.updatedAt.toISOString(),
		};
	});

export const saveShop = createServerFn({ method: "POST" })
	.validator((d: OwnerInput & { shop: unknown }) => ({
		...ownerInput(d),
		shop: cleanShop(d?.shop),
	}))
	.handler(async ({ data }) => {
		const row = await ownerRow(data.slug, data.k);
		// owners can't flip a preview into a live shop or back; only admin can
		const shop = {
			...data.shop,
			demo: row.data.demo,
			demoNote: row.data.demoNote,
			schemaType: row.data.schemaType,
		};
		const errors = shopErrors(shop);
		if (errors.length) return { ok: false as const, errors };
		const db = await getDb();
		await db
			.update(shops)
			.set({ data: shop, updatedAt: new Date() })
			.where(eq(shops.slug, data.slug));
		return { ok: true as const, errors: [] };
	});

type AdminInput = { k: string };
const adminOnly = (k: unknown) => {
	if (!isAdmin(k)) throw new Error("forbidden");
};

export const adminListShops = createServerFn({ method: "POST" })
	.validator((d: AdminInput) => d)
	.handler(async ({ data }) => {
		if (!isAdmin(data?.k)) return forbidden();
		const db = await getDb();
		const rows = await db
			.select({
				slug: shops.slug,
				data: shops.data,
				updatedAt: shops.updatedAt,
			})
			.from(shops)
			.orderBy(shops.createdAt);
		return {
			ok: true as const,
			shops: rows.map((r) => ({
				slug: r.slug,
				name: r.data.name,
				demo: !!r.data.demo,
				updatedAt: r.updatedAt.toISOString(),
			})),
		};
	});

// Creates a shop from JSON (shops/*.json format) and returns its new owner token
export const adminCreateShop = createServerFn({ method: "POST" })
	.validator((d: AdminInput & { slug: string; json: string }) => d)
	.handler(async ({ data }) => {
		adminOnly(data?.k);
		const slug = asSlug(data.slug);
		let parsed: unknown;
		try {
			parsed = JSON.parse(data.json);
		} catch {
			return { ok: false as const, errors: ["JSON ไม่ถูกต้อง"] };
		}
		const shop = cleanShop(parsed);
		const errors = shopErrors(shop);
		if (errors.length) return { ok: false as const, errors };
		const token = newToken();
		const db = await getDb();
		const inserted = await db
			.insert(shops)
			.values({ slug, data: shop, ownerTokenHash: hashToken(token) })
			.onConflictDoNothing()
			.returning({ slug: shops.slug });
		if (!inserted.length)
			return { ok: false as const, errors: [`มีร้าน ${slug} อยู่แล้ว`] };
		return { ok: true as const, token };
	});

// Issues a new owner link; the old one stops working
export const adminResetOwnerLink = createServerFn({ method: "POST" })
	.validator((d: AdminInput & { slug: string }) => d)
	.handler(async ({ data }) => {
		adminOnly(data?.k);
		const slug = asSlug(data.slug);
		const token = newToken();
		const db = await getDb();
		const updated = await db
			.update(shops)
			.set({ ownerTokenHash: hashToken(token) })
			.where(eq(shops.slug, slug))
			.returning({ slug: shops.slug });
		if (!updated.length) throw new Error("not found");
		return { token };
	});
