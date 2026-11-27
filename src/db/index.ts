import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import cafe from "../../shops/demo-cafe.json";
import spa from "../../shops/demo-spa.json";
import { cleanShop } from "../lib/shop.ts";
import { hashToken, newToken } from "../server/token.ts";
import * as schema from "./schema.ts";

// Dev: pick up .env. Dokploy env vars win; a missing file is fine.
try {
	process.loadEnvFile(".env");
} catch {}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

async function seedDemos() {
	const demos = { "demo-cafe": cafe, "demo-spa": spa };
	for (const [slug, data] of Object.entries(demos)) {
		await db
			.insert(schema.shops)
			// nobody holds this token; reset it from /admin to edit a demo
			.values({
				slug,
				data: cleanShop(data),
				ownerTokenHash: hashToken(newToken()),
			})
			.onConflictDoNothing();
	}
}

let ready: Promise<typeof db> | undefined;
// Migrations and demo seeding run once per process, on first use. drizzle/ ships next to the server.
export function getDb() {
	ready ??= migrate(db, {
		migrationsFolder: process.env.MIGRATIONS_DIR ?? "drizzle",
	})
		.then(seedDemos)
		.then(() => db)
		.catch((e) => {
			ready = undefined;
			throw e;
		});
	return ready;
}
