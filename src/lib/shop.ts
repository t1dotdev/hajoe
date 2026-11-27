// Shop data model shared by the public page, the owner editor and the server.
export const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type Day = (typeof DAYS)[number];
export const WEEK: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_TH: Record<Day, string> = {
	mon: "จันทร์",
	tue: "อังคาร",
	wed: "พุธ",
	thu: "พฤหัสบดี",
	fri: "ศุกร์",
	sat: "เสาร์",
	sun: "อาทิตย์",
};
const SCHEMA_DAY: Record<Day, string> = {
	mon: "Monday",
	tue: "Tuesday",
	wed: "Wednesday",
	thu: "Thursday",
	fri: "Friday",
	sat: "Saturday",
	sun: "Sunday",
};

export type Range = [string, string];
export type MenuItem = { name: string; desc?: string; price?: string };
export type MenuGroup = { group: string; items: MenuItem[] };
export type Photo = { src: string; alt?: string };
export type ShopData = {
	demo?: boolean;
	demoNote?: string;
	schemaType?: string;
	name: string;
	category: string;
	area?: string;
	tagline: string;
	hero: string;
	heroAlt?: string;
	about?: string;
	highlights?: string[];
	phone?: string;
	line?: string;
	facebook?: string;
	instagram?: string;
	address: string;
	mapsQuery?: string;
	priceRange?: string;
	hours: Partial<Record<Day, Range[]>>;
	menuTitle?: string;
	menu?: MenuGroup[];
	gallery?: Photo[];
	theme?: { brand?: string };
};

export const BRAND_PRESETS = [
	"#171717",
	"#5b3a29",
	"#7a4b8c",
	"#0f766e",
	"#b91c1c",
	"#1d4ed8",
	"#c2410c",
	"#4d7c0f",
];
export const DEFAULT_BRAND = "#171717";

const str = (v: unknown, max: number) =>
	typeof v === "string" ? v.trim().slice(0, max) : undefined;
const opt = (v: string | undefined) => (v ? v : undefined);

// Keep only known fields, trimmed and length-capped. Used on every write from a browser.
export function cleanShop(input: unknown): ShopData {
	const s = (input ?? {}) as Record<string, unknown>;
	const hours: Partial<Record<Day, Range[]>> = {};
	const rawHours = (s.hours ?? {}) as Record<string, unknown>;
	for (const d of DAYS) {
		const ranges = rawHours[d];
		if (Array.isArray(ranges))
			hours[d] = ranges
				.slice(0, 3)
				.map(
					(r) =>
						(Array.isArray(r)
							? [str(r[0], 5) ?? "", str(r[1], 5) ?? ""]
							: ["", ""]) as Range,
				);
	}
	const menu = Array.isArray(s.menu)
		? s.menu.slice(0, 20).map((g) => {
				const gg = (g ?? {}) as Record<string, unknown>;
				return {
					group: str(gg.group, 60) ?? "",
					items: (Array.isArray(gg.items) ? gg.items : [])
						.slice(0, 60)
						.map((i) => {
							const ii = (i ?? {}) as Record<string, unknown>;
							return {
								name: str(ii.name, 80) ?? "",
								desc: opt(str(ii.desc, 200)),
								price: opt(str(ii.price, 40)),
							};
						}),
				};
			})
		: undefined;
	const gallery = Array.isArray(s.gallery)
		? s.gallery.slice(0, 12).map((p) => {
				const pp = (p ?? {}) as Record<string, unknown>;
				return { src: str(pp.src, 300) ?? "", alt: opt(str(pp.alt, 120)) };
			})
		: undefined;
	const theme = (s.theme ?? {}) as Record<string, unknown>;
	return {
		demo: s.demo === true || undefined,
		demoNote: opt(str(s.demoNote, 120)),
		schemaType: opt(str(s.schemaType, 40)),
		name: str(s.name, 80) ?? "",
		category: str(s.category, 60) ?? "",
		area: opt(str(s.area, 60)),
		tagline: str(s.tagline, 160) ?? "",
		hero: str(s.hero, 300) ?? "",
		heroAlt: opt(str(s.heroAlt, 120)),
		about: opt(str(s.about, 2000)),
		highlights: Array.isArray(s.highlights)
			? s.highlights
					.map((h) => str(h, 60))
					.filter((h): h is string => !!h)
					.slice(0, 10)
			: undefined,
		phone: opt(str(s.phone, 20)),
		line: opt(str(s.line, 80)),
		facebook: opt(str(s.facebook, 200)),
		instagram: opt(str(s.instagram, 200)),
		address: str(s.address, 300) ?? "",
		mapsQuery: opt(str(s.mapsQuery, 200)),
		priceRange: opt(str(s.priceRange, 20)),
		hours,
		menuTitle: opt(str(s.menuTitle, 60)),
		menu,
		gallery,
		theme: { brand: opt(str(theme.brand, 7)) },
	};
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
// Images are either our uploads, the bundled demo photos, or https URLs; never javascript: or data:
const IMG = /^(\/u\/[\w./-]+|\/demo\/img\/[\w.-]+|https:\/\/\S+)$/;

export function shopErrors(s: ShopData): string[] {
	const e: string[] = [];
	if (!s.name) e.push("ใส่ชื่อร้าน");
	if (!s.category) e.push("ใส่ประเภทร้าน");
	if (!s.tagline) e.push("ใส่คำโปรยสั้น ๆ");
	if (!s.address) e.push("ใส่ที่อยู่ร้าน");
	if (!s.hero) e.push("ใส่รูปหน้าปก");
	else if (!IMG.test(s.hero)) e.push("รูปหน้าปกไม่ถูกต้อง");
	for (const p of s.gallery ?? [])
		if (!IMG.test(p.src)) e.push("รูปในแกลเลอรีไม่ถูกต้อง");
	for (const d of DAYS) {
		for (const [a, b] of s.hours[d] ?? []) {
			if (!TIME.test(a) || !TIME.test(b))
				e.push(`เวลาวัน${DAY_TH[d]}: ใช้รูปแบบ 09:00`);
			// shortcut: past-midnight ranges (18:00–02:00) unsupported; split into two days
			else if (b <= a) e.push(`เวลาวัน${DAY_TH[d]}: เวลาปิดต้องหลังเวลาเปิด`);
		}
	}
	if (s.phone && !/^[0-9+\-\s]{6,20}$/.test(s.phone)) e.push("เบอร์โทรไม่ถูกต้อง");
	if (
		s.line &&
		!/^(@?[\w.-]{1,40}|https:\/\/line\.me\/\S+|https:\/\/lin\.ee\/\S+)$/.test(
			s.line,
		)
	)
		e.push("LINE ID ไม่ถูกต้อง");
	if (
		s.facebook &&
		!/^https:\/\/(www\.|m\.)?facebook\.com\/\S+$/.test(s.facebook)
	)
		e.push("ลิงก์ Facebook ไม่ถูกต้อง");
	if (
		s.instagram &&
		!/^https:\/\/(www\.)?instagram\.com\/\S+$/.test(s.instagram)
	)
		e.push("ลิงก์ Instagram ไม่ถูกต้อง");
	if (s.theme?.brand && !/^#[0-9a-fA-F]{6}$/.test(s.theme.brand))
		e.push("สีร้านไม่ถูกต้อง");
	for (const g of s.menu ?? [])
		for (const i of g.items) if (!i.name) e.push("รายการเมนูต้องมีชื่อ");
	if (!s.demo && !s.phone && !s.line) e.push("ใส่เบอร์โทรหรือ LINE อย่างน้อยหนึ่งช่อง");
	return [...new Set(e)];
}

export const brandOf = (s: ShopData) => s.theme?.brand || DEFAULT_BRAND;

export const lineUrl = (id: string) =>
	id.startsWith("http")
		? id
		: `https://line.me/R/ti/p/${encodeURIComponent(id.startsWith("@") ? id : `~${id}`)}`;
export const telUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const mapsQ = (s: ShopData) =>
	encodeURIComponent(s.mapsQuery || `${s.name} ${s.address}`);
export const directionsUrl = (s: ShopData) =>
	`https://www.google.com/maps/dir/?api=1&destination=${mapsQ(s)}`;
export const mapEmbedUrl = (s: ShopData) =>
	`https://www.google.com/maps?q=${mapsQ(s)}&output=embed`;

const minutes = (t: string) => {
	const [h, m] = t.split(":");
	return Number(h) * 60 + Number(m);
};

// Bangkok weekday index (0 = Sunday) and minutes since midnight
export function bangkokNow(now: Date) {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Bangkok",
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).formatToParts(now);
	const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
	return {
		weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
			get("weekday"),
		),
		minute: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
	};
}

export function openStatus(
	hours: ShopData["hours"],
	now: Date,
): { open: boolean; text: string; today: Day } {
	const { weekday, minute } = bangkokNow(now);
	const today = DAYS[weekday];
	const ranges = hours[today] ?? [];
	const current = ranges.find(
		([a, b]) => minute >= minutes(a) && minute < minutes(b),
	);
	if (current)
		return { open: true, text: `เปิดอยู่ · ปิด ${current[1]} น.`, today };
	const later = ranges.find(([a]) => minutes(a) > minute);
	if (later)
		return { open: false, text: `ปิดอยู่ · เปิดวันนี้ ${later[0]} น.`, today };
	for (let i = 1; i <= 7; i++) {
		const r = hours[DAYS[(weekday + i) % 7]];
		if (r?.length)
			return {
				open: false,
				text: `ปิดอยู่ · เปิด${i === 1 ? "พรุ่งนี้" : `อีกครั้งใน ${i} วัน`} ${r[0][0]} น.`,
				today,
			};
	}
	return { open: false, text: "ปิดอยู่", today };
}

export function jsonLd(s: ShopData, url: string) {
	const abs = (p: string) => new URL(p, url).href;
	const data: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": s.schemaType || "LocalBusiness",
		name: s.name,
		description: s.about || s.tagline,
		url,
		image: abs(s.hero),
		address: {
			"@type": "PostalAddress",
			streetAddress: s.address,
			addressCountry: "TH",
		},
		openingHoursSpecification: DAYS.flatMap((d) =>
			(s.hours[d] ?? []).map(([opens, closes]) => ({
				"@type": "OpeningHoursSpecification",
				dayOfWeek: SCHEMA_DAY[d],
				opens,
				closes,
			})),
		),
	};
	if (s.phone && !s.demo) data.telephone = s.phone;
	if (s.priceRange) data.priceRange = s.priceRange;
	const sameAs = [s.facebook, s.instagram].filter(Boolean);
	if (sameAs.length) data.sameAs = sameAs;
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
