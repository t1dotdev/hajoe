import { Check, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import {
	brandOf,
	DAY_TH,
	directionsUrl,
	lineUrl,
	mapEmbedUrl,
	openStatus,
	type ShopData,
	telUrl,
	WEEK,
} from "@/lib/shop";
import type { StatEvent } from "@/lib/stats";
import { cn } from "@/lib/utils";

// Fire-and-forget counter; sendBeacon survives the page leaving for tel:/LINE/Maps
export function track(slug: string, event: StatEvent) {
	try {
		navigator.sendBeacon?.("/api/hit", JSON.stringify({ slug, event }));
	} catch {}
}

type Action = {
	event: StatEvent;
	href: string;
	label: string;
	short: string;
	icon: ReactNode;
};

function actionsFor(s: ShopData): Action[] {
	const a: Action[] = [];
	if (s.phone)
		a.push({
			event: "call",
			href: telUrl(s.phone),
			label: "โทรหาร้าน",
			short: "โทร",
			icon: <Phone />,
		});
	if (s.line)
		a.push({
			event: "line",
			href: lineUrl(s.line),
			label: "แชท LINE",
			short: "LINE",
			icon: <MessageCircle />,
		});
	a.push({
		event: "directions",
		href: directionsUrl(s),
		label: "นำทางไปร้าน",
		short: "นำทาง",
		icon: <Navigation />,
	});
	return a;
}

function Section({
	id,
	title,
	children,
}: {
	id?: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section id={id} className="scroll-mt-16 border-t py-9">
			<h2 className="mb-5 text-xl font-bold tracking-tight">{title}</h2>
			{children}
		</section>
	);
}

export function ShopPage({ slug, shop }: { slug: string; shop: ShopData }) {
	const [status, setStatus] = useState<ReturnType<typeof openStatus> | null>(
		null,
	);
	const [toast, setToast] = useState("");
	const actions = actionsFor(shop);
	const groups = (shop.menu ?? []).filter((g) => g.items.length);

	useEffect(() => {
		const tick = () => setStatus(openStatus(shop.hours, new Date()));
		tick();
		const id = setInterval(tick, 60_000);
		const key = `hj:v:${slug}`;
		if (!sessionStorage.getItem(key)) {
			sessionStorage.setItem(key, "1");
			track(slug, "view");
		}
		return () => clearInterval(id);
	}, [slug, shop.hours]);

	useEffect(() => {
		if (!toast) return;
		const id = setTimeout(() => setToast(""), 3200);
		return () => clearTimeout(id);
	}, [toast]);

	const onAction = (a: Action) => (e: React.MouseEvent) => {
		track(slug, a.event);
		if (shop.demo) {
			e.preventDefault();
			setToast("นี่คือเว็บตัวอย่าง ในเว็บจริงปุ่มนี้โทร แชท หรือนำทางได้ทันที");
		}
	};

	const ActionLink = ({
		a,
		primary,
		compact,
	}: {
		a: Action;
		primary: boolean;
		compact?: boolean;
	}) => (
		<a
			href={a.href}
			onClick={onAction(a)}
			{...(a.href.startsWith("http")
				? { target: "_blank", rel: "noopener" }
				: {})}
			className={cn(
				"flex items-center justify-center gap-2 rounded-2xl font-semibold transition-opacity hover:opacity-90 [&_svg]:size-5",
				compact
					? "h-14 flex-1 flex-col gap-0.5 text-xs [&_svg]:size-5"
					: "h-12 px-5 text-[15px]",
				primary
					? "bg-[var(--brand)] text-white"
					: "border bg-background text-foreground",
			)}
		>
			{a.icon}
			{compact ? a.short : a.label}
		</a>
	);

	return (
		<div
			style={{ "--brand": brandOf(shop) } as CSSProperties}
			className="min-h-svh bg-background pb-24 md:pb-0"
		>
			{shop.demo && (
				<div className="bg-neutral-900 px-4 py-2 text-center text-sm text-white">
					{shop.demoNote || "เว็บตัวอย่างของร้านสมมติ"}{" "}
					<a
						href="/#pricing"
						className="font-semibold underline underline-offset-4"
					>
						อยากได้แบบนี้ให้ร้านคุณ
					</a>
				</div>
			)}

			<header className="relative">
				<img
					src={shop.hero}
					alt={shop.heroAlt || shop.name}
					fetchPriority="high"
					className="h-[60svh] max-h-[560px] min-h-[340px] w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
				<div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-5 pb-7 text-white">
					<p className="text-sm font-medium text-white/85">
						{shop.category}
						{shop.area && ` · ${shop.area}`}
					</p>
					<h1 className="mt-1 text-4xl leading-tight font-bold tracking-tight text-balance md:text-5xl">
						{shop.name}
					</h1>
					<p className="mt-2 max-w-xl text-base text-pretty text-white/90 md:text-lg">
						{shop.tagline}
					</p>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-5">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-5">
					<p
						className="flex items-center gap-2 text-sm font-medium"
						aria-live="polite"
					>
						<span
							className={cn(
								"size-2.5 rounded-full",
								!status && "bg-neutral-300",
								status?.open &&
									"bg-emerald-500 shadow-[0_0_0_4px] shadow-emerald-500/20",
								status && !status.open && "bg-red-500",
							)}
						/>
						{status?.text ?? "ดูเวลาเปิด–ปิดด้านล่าง"}
					</p>
					{shop.priceRange && (
						<p className="text-sm text-muted-foreground">
							ราคา {shop.priceRange}
						</p>
					)}
				</div>

				<div className="hidden gap-3 pb-6 md:flex">
					{actions.map((a, i) => (
						<ActionLink key={a.event} a={a} primary={i === 0} />
					))}
				</div>

				{(shop.about || shop.highlights?.length) && (
					<Section title="เกี่ยวกับร้าน">
						{shop.about?.split("\n").map((p) => (
							<p
								key={p}
								className="mb-3 max-w-prose leading-relaxed text-pretty"
							>
								{p}
							</p>
						))}
						{!!shop.highlights?.length && (
							<ul className="mt-4 flex flex-wrap gap-2">
								{shop.highlights.map((h) => (
									<li
										key={h}
										className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--brand)_9%,white)] px-3 py-1.5 text-sm font-medium"
									>
										<Check className="size-4 text-[var(--brand)]" />
										{h}
									</li>
								))}
							</ul>
						)}
					</Section>
				)}

				{groups.length > 0 && (
					<Section id="menu" title={shop.menuTitle || "เมนูและราคา"}>
						{groups.length > 1 && (
							<nav
								aria-label="หมวดเมนู"
								className="sticky top-0 z-10 -mx-5 mb-4 flex gap-2 overflow-x-auto bg-background/90 px-5 py-2 backdrop-blur-md"
							>
								{groups.map((g, i) => (
									<a
										key={g.group}
										href={`#g${i}`}
										className="shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap hover:bg-muted"
									>
										{g.group}
									</a>
								))}
							</nav>
						)}
						<div className="grid gap-6">
							{groups.map((g, i) => (
								<div key={g.group} id={`g${i}`} className="scroll-mt-28">
									<h3 className="mb-2 text-sm font-semibold tracking-wide text-[var(--brand)]">
										{g.group}
									</h3>
									<ul className="divide-y rounded-2xl border">
										{g.items.map((it) => (
											<li
												key={it.name}
												className="flex items-start justify-between gap-4 px-4 py-3.5"
											>
												<div>
													<p className="font-medium">{it.name}</p>
													{it.desc && (
														<p className="mt-0.5 text-sm text-muted-foreground">
															{it.desc}
														</p>
													)}
												</div>
												{it.price && (
													<p className="font-semibold whitespace-nowrap text-[var(--brand)] tabular-nums">
														{it.price}
													</p>
												)}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</Section>
				)}

				{!!shop.gallery?.length && (
					<Section title="บรรยากาศร้าน">
						<div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:px-0">
							{shop.gallery.map((p) => (
								<img
									key={p.src}
									src={p.src}
									alt={p.alt || ""}
									loading="lazy"
									className="aspect-[4/5] w-64 shrink-0 snap-start rounded-2xl object-cover md:w-full"
								/>
							))}
						</div>
					</Section>
				)}

				<Section title="เวลาเปิด–ปิด">
					<ul className="max-w-md divide-y rounded-2xl border">
						{WEEK.map((d) => {
							const ranges = shop.hours[d] ?? [];
							const today = status?.today === d;
							return (
								<li
									key={d}
									className={cn(
										"flex items-center justify-between px-4 py-3 text-sm",
										today &&
											"bg-[color-mix(in_oklab,var(--brand)_8%,white)] font-semibold",
									)}
								>
									<span className="flex items-center gap-2">
										{DAY_TH[d]}
										{today && (
											<span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[11px] text-white">
												วันนี้
											</span>
										)}
									</span>
									<span
										className={cn(
											"tabular-nums",
											!ranges.length && "text-muted-foreground",
										)}
									>
										{ranges.length
											? ranges.map(([a, b]) => `${a}–${b}`).join(", ")
											: "ปิด"}
									</span>
								</li>
							);
						})}
					</ul>
				</Section>

				<Section title="ที่ตั้งร้าน">
					<p className="flex items-start gap-2">
						<MapPin className="mt-1 size-4 shrink-0 text-[var(--brand)]" />
						{shop.address}
					</p>
					<iframe
						title={`แผนที่ ${shop.name}`}
						src={mapEmbedUrl(shop)}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						className="mt-4 h-72 w-full rounded-2xl border bg-muted"
					/>
				</Section>
			</main>

			<footer className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 border-t px-5 py-8 text-sm text-muted-foreground">
				<div className="flex items-center gap-3">
					<span>
						© {new Date().getFullYear()} {shop.name}
					</span>
					{shop.facebook && (
						<a
							href={shop.facebook}
							target="_blank"
							rel="noopener"
							className="hover:text-foreground"
						>
							Facebook
						</a>
					)}
					{shop.instagram && (
						<a
							href={shop.instagram}
							target="_blank"
							rel="noopener"
							className="hover:text-foreground"
						>
							Instagram
						</a>
					)}
				</div>
				<a href="/" className="hover:text-foreground">
					เว็บร้านโดย หาเจอ
				</a>
			</footer>

			<div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t bg-background/92 px-3 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
				{actions.map((a, i) => (
					<ActionLink key={a.event} a={a} primary={i === 0} compact />
				))}
			</div>

			{toast && (
				<output className="fixed bottom-24 left-1/2 z-30 max-w-[90vw] -translate-x-1/2 rounded-2xl bg-neutral-900 px-4 py-3 text-sm text-white shadow-lg">
					{toast}
				</output>
			)}
		</div>
	);
}
