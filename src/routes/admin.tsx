import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Forbidden } from "@/components/forbidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	adminCreateShop,
	adminListShops,
	adminResetOwnerLink,
} from "@/server/shops";
import cafe from "../../shops/demo-cafe.json";

// Operator page for หาเจอ. Off unless ADMIN_TOKEN is set; open with /admin?k=<ADMIN_TOKEN>.
export const Route = createFileRoute("/admin")({
	validateSearch: (s: Record<string, unknown>) => ({
		k: typeof s.k === "string" ? s.k : "",
	}),
	loaderDeps: ({ search }) => ({ k: search.k }),
	loader: ({ deps }) => adminListShops({ data: { k: deps.k } }),
	head: () => ({
		meta: [
			{ title: "Admin · หาเจอ" },
			{ name: "robots", content: "noindex, nofollow" },
			{ name: "referrer", content: "no-referrer" },
		],
	}),
	errorComponent: () => (
		<p className="p-8 text-center text-muted-foreground">ไม่มีสิทธิ์เข้าหน้านี้</p>
	),
	component: Admin,
});

const ownerLink = (slug: string, token: string) =>
	`${window.location.origin}/m/${slug}?k=${encodeURIComponent(token)}`;

const template = JSON.stringify(
	{ ...cafe, demo: false, demoNote: undefined, demoBackUrl: undefined },
	null,
	2,
);

type ShopList = Extract<
	Awaited<ReturnType<typeof adminListShops>>,
	{ ok: true }
>["shops"];

function Admin() {
	const data = Route.useLoaderData();
	if (!data.ok)
		return <Forbidden title="ไม่มีสิทธิ์เข้าหน้านี้" message="ลิงก์ผู้ดูแลไม่ถูกต้อง" />;
	return <AdminPanel shops={data.shops} />;
}

function AdminPanel({ shops }: { shops: ShopList }) {
	const { k } = Route.useSearch();
	const router = useRouter();
	const [slug, setSlug] = useState("");
	const [json, setJson] = useState(template);
	const [result, setResult] = useState<{ link?: string; errors?: string[] }>(
		{},
	);
	const [links, setLinks] = useState<Record<string, string>>({});

	const create = async () => {
		const res = await adminCreateShop({ data: { k, slug, json } }).catch(
			(e: Error) => ({
				ok: false as const,
				errors: [e.message],
			}),
		);
		if (res.ok) {
			setResult({ link: ownerLink(slug, res.token) });
			router.invalidate();
		} else setResult({ errors: res.errors });
	};

	const reset = async (s: string) => {
		const { token } = await adminResetOwnerLink({ data: { k, slug: s } });
		setLinks((l) => ({ ...l, [s]: ownerLink(s, token) }));
	};

	return (
		<main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
			<h1 className="text-2xl font-bold tracking-tight">ร้านทั้งหมด</h1>
			<Card>
				<CardContent className="divide-y">
					{shops.map((s) => (
						<div key={s.slug} className="grid gap-2 py-3 first:pt-0 last:pb-0">
							<div className="flex flex-wrap items-center gap-2">
								<a
									href={`/s/${s.slug}`}
									target="_blank"
									rel="noopener"
									className="font-semibold hover:underline"
								>
									{s.name}
								</a>
								<span className="text-sm text-muted-foreground">
									/s/{s.slug}
								</span>
								{s.demo && <Badge variant="secondary">ตัวอย่าง</Badge>}
								<Button
									variant="outline"
									size="xs"
									className="ml-auto"
									onClick={() => reset(s.slug)}
								>
									ลิงก์เจ้าของใหม่
								</Button>
							</div>
							{links[s.slug] && (
								<p className="text-xs break-all">
									ส่งลิงก์นี้ให้เจ้าของร้านทาง LINE (ลิงก์เก่าใช้ไม่ได้แล้ว):{" "}
									<span className="font-mono select-all">{links[s.slug]}</span>
								</p>
							)}
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="font-semibold">เพิ่มร้าน</CardTitle>
					<CardDescription>
						ใส่ข้อมูลร้านแบบ JSON (รูปแบบเดียวกับ shops/*.json) ตั้ง "demo": true
						สำหรับเว็บตัวอย่างที่ส่งให้ร้านดูก่อนจ่าย
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<div className="grid gap-1.5">
						<Label htmlFor="slug">ลิงก์ร้าน</Label>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							/s/
							<Input
								id="slug"
								value={slug}
								placeholder="baan-champee"
								onChange={(e) => setSlug(e.target.value.toLowerCase())}
							/>
						</div>
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="json">ข้อมูลร้าน</Label>
						<Textarea
							id="json"
							rows={14}
							className="font-mono text-xs"
							value={json}
							onChange={(e) => setJson(e.target.value)}
						/>
					</div>
					<Button
						className="justify-self-start"
						onClick={create}
						disabled={!slug}
					>
						สร้างร้าน
					</Button>
					{result.errors && (
						<p className="text-sm text-destructive">
							{result.errors.join(" · ")}
						</p>
					)}
					{result.link && (
						<p className="text-sm break-all">
							สร้างแล้ว ส่งลิงก์นี้ให้เจ้าของร้าน:{" "}
							<span className="font-mono select-all">{result.link}</span>
						</p>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
