import { createFileRoute, redirect } from "@tanstack/react-router";

// Old static demo URLs (shared in outreach messages) now live at /s/demo-*
export const Route = createFileRoute("/demo/$")({
	beforeLoad: ({ params }) => {
		const name = (params._splat ?? "").replace(/\/+$/, "");
		if (name === "cafe" || name === "spa")
			throw redirect({
				to: "/s/$slug",
				params: { slug: `demo-${name}` },
				statusCode: 301,
			});
		throw redirect({ to: "/" });
	},
});
