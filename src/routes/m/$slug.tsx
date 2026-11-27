import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Forbidden } from "@/components/forbidden";
import { ShopEditor } from "@/components/owner/shop-editor";
import { StatsPanel } from "@/components/owner/stats-panel";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getOwnerDashboard } from "@/server/shops";

// Owner's private page. The secret link (?k=) comes from หาเจอ over LINE; no password to forget.
export const Route = createFileRoute("/m/$slug")({
	validateSearch: (s: Record<string, unknown>) => ({
		k: typeof s.k === "string" ? s.k : "",
	}),
	loaderDeps: ({ search }) => ({ k: search.k }),
	loader: ({ params, deps }) =>
		getOwnerDashboard({ data: { slug: params.slug, k: deps.k } }),
	head: () => ({
		meta: [
			{ title: "จัดการร้าน · หาเจอ" },
			{ name: "robots", content: "noindex, nofollow" },
			// keep the secret link out of Referer headers when opening external links
			{ name: "referrer", content: "no-referrer" },
		],
	}),
	errorComponent: ({ error }) => (
		<main className="grid min-h-svh place-items-center px-6 text-center">
			<div>
				<h1 className="text-xl font-bold">เปิดหน้าจัดการร้านไม่ได้</h1>
				<p className="mt-2 text-muted-foreground">{(error as Error).message}</p>
			</div>
		</main>
	),
	component: Owner,
});

function Owner() {
	const data = Route.useLoaderData();
	const { slug } = Route.useParams();
	const { k } = Route.useSearch();
	if (!data.ok)
		return (
			<Forbidden
				title="เปิดหน้าจัดการร้านไม่ได้"
				message="ลิงก์นี้ใช้ไม่ได้ ขอลิงก์ใหม่จากหาเจอทาง LINE"
			/>
		);
	const { shop, rows, today } = data;
	return (
		<main className="mx-auto max-w-3xl px-4 py-6">
			<header className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-sm text-muted-foreground">จัดการร้าน</p>
					<h1 className="text-2xl font-bold tracking-tight">{shop.name}</h1>
				</div>
				<a
					href={`/s/${slug}`}
					target="_blank"
					rel="noopener"
					className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
				>
					ดูหน้าร้าน <ExternalLink />
				</a>
			</header>
			<Tabs defaultValue="stats">
				<TabsList className="mb-3">
					<TabsTrigger value="stats">สถิติ</TabsTrigger>
					<TabsTrigger value="edit">แก้ไขร้าน</TabsTrigger>
				</TabsList>
				<TabsContent value="stats">
					<StatsPanel rows={rows} today={today} />
				</TabsContent>
				<TabsContent value="edit">
					<ShopEditor slug={slug} k={k} initial={shop} />
				</TabsContent>
			</Tabs>
		</main>
	);
}
