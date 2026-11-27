import { createFileRoute } from "@tanstack/react-router";
import { readUpload, UPLOAD_PATH } from "@/server/uploads";

const TYPES = {
	jpg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
} as const;

// Serves owner-uploaded photos. File names are random, so they can be cached forever.
export const Route = createFileRoute("/u/$")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const m = UPLOAD_PATH.exec(params._splat ?? "");
				if (!m) return new Response("not found", { status: 404 });
				try {
					const body = await readUpload(m[0]);
					return new Response(body, {
						headers: {
							"content-type": TYPES[m[3] as keyof typeof TYPES],
							"cache-control": "public, max-age=31536000, immutable",
							"x-content-type-options": "nosniff",
						},
					});
				} catch {
					return new Response("not found", { status: 404 });
				}
			},
		},
	},
});
