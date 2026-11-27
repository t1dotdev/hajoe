import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { shops } from "@/db/schema";
import { SLUG } from "@/lib/shop";
import { tokenMatches } from "@/server/token";
import { MAX_UPLOAD, saveUpload, sniffImage } from "@/server/uploads";

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});

// Owner photo upload: multipart form with slug, k (owner token) and file
export const Route = createFileRoute("/api/upload")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const form = await request.formData().catch(() => null);
				const slug = form?.get("slug");
				const file = form?.get("file");
				if (
					typeof slug !== "string" ||
					!SLUG.test(slug) ||
					!(file instanceof Blob)
				)
					return json({ error: "ข้อมูลไม่ครบ" }, 400);
				const db = await getDb();
				const [row] = await db
					.select({ hash: shops.ownerTokenHash })
					.from(shops)
					.where(eq(shops.slug, slug));
				if (!row || !tokenMatches(form?.get("k"), row.hash))
					return json({ error: "ลิงก์นี้ใช้ไม่ได้" }, 403);
				if (file.size > MAX_UPLOAD)
					return json({ error: "รูปใหญ่เกิน 3 MB" }, 413);
				const bytes = new Uint8Array(await file.arrayBuffer());
				const ext = sniffImage(bytes);
				if (!ext) return json({ error: "รองรับเฉพาะรูป JPG, PNG, WebP" }, 415);
				return json({ src: await saveUpload(slug, bytes, ext) });
			},
		},
	},
});
