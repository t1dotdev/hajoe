import { createFileRoute, notFound } from "@tanstack/react-router";
import { ShopPage } from "@/components/shop/shop-page";
import { siteUrl } from "@/config";
import { jsonLd } from "@/lib/shop";
import { getShop } from "@/server/shops";

export const Route = createFileRoute("/s/$slug")({
	loader: async ({ params }) => {
		const shop = await getShop({ data: params.slug }).catch(() => null);
		if (!shop) throw notFound();
		return shop;
	},
	head: ({ loaderData: s, params }) => {
		if (!s) return {};
		const url = `${siteUrl}/s/${params.slug}`;
		return {
			meta: [
				{ title: `${s.name} · ${s.category}${s.area ? ` ${s.area}` : ""}` },
				{ name: "description", content: s.tagline },
				{ property: "og:title", content: s.name },
				{ property: "og:description", content: s.tagline },
				{ property: "og:image", content: new URL(s.hero, siteUrl).href },
				{ property: "og:url", content: url },
				{ property: "og:type", content: "website" },
				...(s.demo ? [{ name: "robots", content: "noindex" }] : []),
			],
			links: [{ rel: "canonical", href: url }],
			scripts: [{ type: "application/ld+json", children: jsonLd(s, url) }],
		};
	},
	component: function Shop() {
		const shop = Route.useLoaderData();
		const { slug } = Route.useParams();
		return <ShopPage slug={slug} shop={shop} />;
	},
});
