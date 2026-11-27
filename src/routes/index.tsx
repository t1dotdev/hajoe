import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowUpRight,
	Check,
	Globe,
	MapPin,
	MessageCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { MapsDemo } from "@/components/maps-demo";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { GridPattern } from "@/components/ui/grid-pattern";
import { contact, promo } from "@/config";
import { contactHref, greeting, lineHref, messengerHref } from "@/lib/contact";
import { baht, priceNow, promoActive } from "@/lib/promo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

// buttonVariants on an <a> needs tailwind-merge, or the base border-transparent beats the outline border
const btn = (...args: Parameters<typeof buttonVariants>) =>
	cn(buttonVariants(...args));

const ext = (href: string) =>
	href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {};

function ContactLink({
	plan,
	className,
	children,
}: {
	plan?: string;
	className?: string;
	children: ReactNode;
}) {
	const href = contactHref(contact, plan);
	return (
		<a href={href} {...ext(href)} className={className}>
			{children}
		</a>
	);
}

function Checks({ items, className }: { items: string[]; className?: string }) {
	return (
		<ul className={cn("grid gap-2.5 text-sm", className)}>
			{items.map((item) => (
				<li key={item} className="grid grid-cols-[16px_1fr] gap-2.5">
					<Check className="mt-0.5 size-4" />
					{item}
				</li>
			))}
		</ul>
	);
}

function SectionHead({
	title,
	children,
}: {
	title: string;
	children?: ReactNode;
}) {
	return (
		<div className="mb-10 max-w-2xl md:mb-12">
			<h2 className="text-3xl leading-tight font-bold tracking-tight text-balance md:text-4xl">
				{title}
			</h2>
			{children && (
				<p className="mt-3 text-base text-pretty text-muted-foreground md:text-lg">
					{children}
				</p>
			)}
		</div>
	);
}

const features = [
	{
		icon: <MapPin />,
		title: "ปักหมุด Google Maps",
		desc: "สร้างหรือรับช่วงโปรไฟล์ร้านบน Google แล้วจัดให้ครบ",
		items: [
			"หมวดร้าน คำอธิบาย และคีย์เวิร์ดที่คนค้นจริง",
			"เวลาเปิด–ปิด เบอร์ และลิงก์เว็บ",
			"รูปร้านและเมนูที่ปรับแสงแล้ว 10 รูป",
			"ป้าย QR ขอรีวิวไว้ตั้งที่เคาน์เตอร์",
		],
	},
	{
		icon: <MessageCircle />,
		title: "ตั้งค่า LINE OA",
		desc: "สร้างใหม่ หรือจัดบัญชีเดิมของคุณให้ครบ",
		items: [
			"ริชเมนู 6 ปุ่ม ออกแบบตามสีร้าน",
			"ข้อความทักทาย และตอบอัตโนมัติ 10 คำถาม เช่น ราคา เวลาเปิด ที่จอดรถ",
			"คูปองต้อนรับเพื่อนใหม่ 1 ชุด",
			"ป้าย QR แอดไลน์สำหรับหน้าร้าน",
		],
	},
	{
		icon: <Globe />,
		title: "เว็บไซต์ร้านหนึ่งหน้า",
		desc: "เปิดบนมือถือเร็ว ลูกค้ากดโทร แชท นำทางได้ทันที",
		items: [
			"บอกสถานะ “เปิดอยู่ / ปิดแล้ว” ให้อัตโนมัติ",
			"เมนูหรือบริการพร้อมราคา รูปบรรยากาศ แผนที่",
			"ตั้งค่าให้ Google เข้าใจว่าเป็นร้านค้าในพื้นที่",
			"โฮสต์ให้ฟรีปีแรก ไม่มีโฆษณาแทรก",
		],
	},
];

const examples = [
	{
		href: "/s/demo-cafe",
		img: "/demo/img/cafe-latte.jpg",
		alt: "หน้าเว็บตัวอย่างคาเฟ่ นกฮูกตื่นเช้า",
		name: "นกฮูกตื่นเช้า",
		desc: "คาเฟ่ เมนูพร้อมราคา สถานะเปิด–ปิด แผนที่",
	},
	{
		href: "/s/demo-spa",
		img: "/demo/img/spa-aroma.webp",
		alt: "หน้าเว็บตัวอย่างร้านนวด บ้านจำปี",
		name: "บ้านจำปี นวดไทย",
		desc: "ร้านนวด ราคาบริการ จองผ่าน LINE เวลาเปิด",
	},
];

const plans = [
	{
		name: "หาเจอ + ทักไลน์",
		desc: "Google Maps + LINE OA",
		regular: 2990,
		discountable: true,
		unit: "บาท",
		cta: "เลือกแพ็กนี้",
		items: [
			"โปรไฟล์ Google Maps ครบทุกช่อง",
			"รูปร้านและเมนู 10 รูป ปรับแสงให้",
			"LINE OA ริชเมนู 6 ปุ่ม ตอบอัตโนมัติ 10 คำถาม คูปองต้อนรับ",
			"ป้าย QR ขอรีวิว และป้าย QR แอดไลน์ พร้อมพิมพ์",
			"เสร็จใน 48 ชั่วโมง",
		],
	},
	{
		name: "ครบชุด + เว็บร้าน",
		desc: "ทุกอย่างในแพ็กแรก + เว็บไซต์ร้าน",
		regular: 4990,
		discountable: true,
		unit: "บาท",
		cta: "เลือกแพ็กนี้",
		featured: true,
		items: [
			"ทุกอย่างในแพ็ก หาเจอ + ทักไลน์",
			"เว็บไซต์ร้านหนึ่งหน้า แบบเว็บตัวอย่าง",
			"โฮสต์เว็บฟรีปีแรก",
			"แก้ข้อมูลฟรี 30 วันหลังส่งงาน",
			"เสร็จใน 3 วัน",
		],
	},
	{
		name: "ดูแลรายเดือน",
		desc: "เพิ่มได้หลังทำแพ็กไหนก็ได้ ยกเลิกได้ทุกเมื่อ",
		regular: 490,
		discountable: false,
		unit: "บาท / เดือน",
		cta: "สอบถาม",
		items: [
			"แก้เมนู ราคา เวลาเปิด วันหยุด ไม่จำกัด ส่งทาง LINE",
			"โพสต์อัปเดตบน Google Maps เดือนละ 2 ครั้ง",
			"บรอดแคสต์ LINE ให้เดือนละ 2 ครั้ง",
			"สรุปยอดคนเห็นร้านและกดโทรทุกเดือน",
		],
	},
];

const steps = [
	["ทักมาพร้อมชื่อร้านหรือลิงก์เพจ", "ทาง LINE หรือ Facebook ไม่ต้องเตรียมอะไรเพิ่ม"],
	[
		"รับผลเช็กร้านและตัวอย่างเว็บใน 24 ชั่วโมง",
		"เราดูว่าหมุดร้านคุณขาดอะไร แล้วทำตัวอย่างเว็บจากข้อมูลในเพจคุณ ไม่สนใจก็จบตรงนี้ ไม่มีค่าใช้จ่าย",
	],
	["มัดจำครึ่งหนึ่ง แล้วส่งข้อมูลที่ขาด", "เราส่งแบบฟอร์มสั้น ๆ ให้ เช่น เวลาเปิด ราคา รูปเพิ่มเติม"],
	["ภายใน 48 ชั่วโมงถึง 3 วัน พร้อมใช้", "ตรวจงานด้วยกันบนมือถือคุณ พอใจแล้วจ่ายส่วนที่เหลือ"],
];

const faqs = [
	[
		"ร้านมีหมุดบน Google อยู่แล้ว แต่ไม่ใช่ของเรา ทำได้ไหม",
		"ได้ เราช่วยขอสิทธิ์เป็นเจ้าของโปรไฟล์ผ่านขั้นตอนของ Google ให้ บางร้าน Google จะส่งรหัสยืนยันทางโทรศัพท์หรือให้ถ่ายวิดีโอหน้าร้าน เราจะบอกทีละขั้น",
	],
	[
		"ต้องมีโดเมน .com ของตัวเองไหม",
		"ไม่จำเป็น เว็บจะใช้งานได้ทันทีบนลิงก์ที่เราให้ ถ้าอยากได้ชื่อโดเมนของร้าน เช่น ชื่อร้าน.com เราจดให้ได้ ค่าโดเมนประมาณ 400–600 บาทต่อปี จ่ายตามจริง",
	],
	[
		"หลังส่งงาน ถ้าอยากแก้ราคาหรือเมนูต้องทำยังไง",
		"30 วันแรกส่งมาทาง LINE ได้เลยไม่มีค่าใช้จ่าย หลังจากนั้นเลือกแพ็กดูแลรายเดือน 490 บาท หรือจ่ายเป็นครั้งก็ได้ ครั้งละ 200 บาท",
	],
	[
		"รับประกันว่าร้านจะขึ้นอันดับหนึ่งไหม",
		"ไม่มีใครรับประกันอันดับบน Google ได้จริง สิ่งที่เรารับประกันคือโปรไฟล์ร้านคุณจะครบทุกช่องที่ Google ใช้จัดอันดับ และลูกค้าที่เจอร้านจะติดต่อคุณได้ในคลิกเดียว",
	],
	[
		"รับเพิ่มรีวิวหรือดาวให้ร้านไหม",
		"ไม่รับ รีวิวปลอมผิดกฎของ Google และเสี่ยงโดนลบหมุดทั้งร้าน เราให้ป้าย QR ที่ลูกค้าจริงสแกนแล้วรีวิวได้ทันที พร้อมข้อความชวนรีวิวให้พนักงานใช้ ร้านที่ทำแบบนี้สม่ำเสมอจะได้รีวิวจริงเพิ่มขึ้นเอง",
	],
	[
		"มี LINE OA อยู่แล้ว ต้องสมัครใหม่ไหม",
		"ไม่ต้อง เราจัดบัญชีเดิมของคุณให้ครบ ทั้งริชเมนู ข้อความทักทาย และตอบอัตโนมัติ ใช้แพ็กเกจฟรีของ LINE ได้ ไม่มีค่าใช้จ่ายเพิ่ม",
	],
	["ร้านอยู่ต่างจังหวัด ทำได้ไหม", "ได้ทั่วประเทศ ทำงานออนไลน์ทั้งหมดผ่าน LINE ไม่ต้องนัดเจอ"],
	[
		"จ่ายเงินยังไง ปลอดภัยไหม",
		"คุณเห็นตัวอย่างงานก่อนจ่ายทุกครั้ง มัดจำ 50% ผ่านพร้อมเพย์ พร้อมใบเสร็จ อีก 50% จ่ายเมื่อตรวจงานแล้ว บัญชี Google Maps และ LINE OA เป็นชื่อร้านคุณเสมอ เราขอสิทธิ์แค่ผู้ดูแลชั่วคราว",
	],
];

function ContactButtons() {
	const links = [
		contact.line && {
			href: lineHref(contact.line, greeting()),
			label: `แชท LINE ${contact.line}`,
		},
		contact.facebook && {
			href: messengerHref(contact.facebook),
			label: "ทัก Messenger",
		},
		contact.phone && {
			href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`,
			label: `โทร ${contact.phone}`,
		},
		contact.email && {
			href: `mailto:${contact.email}?subject=${encodeURIComponent("ขอเช็กร้านฟรี")}`,
			label: "ส่งอีเมล",
		},
	].filter((l): l is { href: string; label: string } => Boolean(l));

	if (!links.length)
		return (
			<p className="text-sm text-muted-foreground">ช่องทางติดต่อกำลังเปิดเร็ว ๆ นี้</p>
		);
	return (
		<div className="flex flex-wrap justify-center gap-3">
			{links.map((l, i) => (
				<a
					key={l.href}
					href={l.href}
					{...ext(l.href)}
					className={btn({
						size: "lg",
						variant: i === 0 ? "default" : "outline",
					})}
				>
					{l.label}
				</a>
			))}
		</div>
	);
}

function Home() {
	const on = promoActive(promo);
	const from = priceNow(plans[0].regular, true, promo);
	return (
		<>
			{on && (
				<div className="bg-primary px-6 py-2 text-center text-sm text-primary-foreground">
					<span className="font-semibold">
						โปรเปิดตัว ลด {baht(promo.discount)} บาท
					</span>{" "}
					แพ็กตั้งค่าทุกแพ็ก สำหรับ {promo.slotsTotal} ร้านแรก เหลืออีก {promo.slotsLeft}{" "}
					ที่ ถึง {promo.endsLabel}{" "}
					<ContactLink
						plan="โปรเปิดตัว"
						className="font-semibold underline underline-offset-4"
					>
						จองสิทธิ์
					</ContactLink>
				</div>
			)}
			<header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
				<div className="mx-auto flex h-15 max-w-6xl items-center justify-between px-6">
					<a
						href="#top"
						className="flex items-center gap-2 font-semibold"
						aria-label="หาเจอ หน้าแรก"
					>
						<span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
							<MapPin className="size-4" />
						</span>
						หาเจอ
					</a>
					<nav aria-label="เมนูหลัก" className="flex items-center gap-6 text-sm">
						{[
							["#features", "บริการ"],
							["#examples", "ตัวอย่าง"],
							["#pricing", "ราคา"],
							["#faq", "คำถาม"],
						].map(([href, label]) => (
							<a
								key={href}
								href={href}
								className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline"
							>
								{label}
							</a>
						))}
						<ContactLink className={btn()}>เช็กร้านฟรี</ContactLink>
					</nav>
				</div>
			</header>

			<main id="top">
				<section className="relative isolate overflow-hidden py-12 md:py-20">
					<GridPattern className="-z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_20%,transparent_75%)] fill-none stroke-neutral-200" />
					<div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_.95fr]">
						<div>
							<Badge variant="outline" className="h-6 bg-background px-2.5">
								<span className="size-1.5 rounded-full bg-emerald-500" />
								{on
									? `ลด ${baht(promo.discount)} บาท สำหรับ ${promo.slotsTotal} ร้านแรก เหลือ ${promo.slotsLeft} ที่`
									: "เช็กร้านฟรี ไม่มีค่าใช้จ่าย"}
							</Badge>
							<h1 className="mt-5 text-4xl leading-[1.2] font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
								ให้ลูกค้าหาร้านคุณเจอบน Google Maps
							</h1>
							<p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
								เราจัดหมุดร้านคุณบน Google Maps ให้ครบทุกช่อง และตั้งค่า LINE OA
								ให้ตอบลูกค้าแทนตอนคุณยุ่ง ลูกค้าเจอร้าน กดโทร แชท หรือนำทางมาได้ในคลิกเดียว
							</p>
							<div className="mt-8 flex flex-wrap gap-3">
								<ContactLink className={btn({ size: "lg" })}>
									เช็กร้านคุณฟรี
								</ContactLink>
								<a
									href="#pricing"
									className={btn({ size: "lg", variant: "outline" })}
								>
									ดูราคา
								</a>
							</div>
							<Checks
								items={[
									`เริ่ม ${baht(from)} บาท`,
									"เสร็จใน 48 ชั่วโมง",
									"เห็นตัวอย่างก่อนจ่าย",
								]}
								className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground [&_li]:flex [&_li]:items-center [&_li]:gap-1.5 [&_svg]:mt-0 [&_svg]:text-foreground"
							/>
						</div>
						<MapsDemo />
					</div>
				</section>

				<section id="features" className="border-t py-16 md:py-24">
					<div className="mx-auto max-w-6xl px-6">
						<SectionHead title="ลูกค้าใหม่ค้นหาบนแผนที่ ไม่ใช่ในฟีด">
							คนที่หิว ปวดหลัง หรือรถเสีย จะเปิด Google Maps แล้วพิมพ์ว่า “ใกล้ฉัน”
							เขาเลือกร้านที่มีรูป มีเวลาเปิด และกดโทรได้ทันที ทุกแพ็กได้หมุด Google Maps กับ
							LINE OA ส่วนเว็บไซต์ร้านอยู่ในแพ็กครบชุด
						</SectionHead>
						<div className="grid gap-5 md:grid-cols-3">
							{features.map((f) => (
								<Card key={f.title}>
									<CardHeader>
										<div className="mb-3 grid size-10 place-items-center rounded-2xl border bg-muted [&_svg]:size-5">
											{f.icon}
										</div>
										<CardTitle className="text-base font-semibold">
											{f.title}
										</CardTitle>
										<CardDescription>{f.desc}</CardDescription>
									</CardHeader>
									<CardContent>
										<Checks items={f.items} />
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				<section id="examples" className="border-t bg-muted/40 py-16 md:py-24">
					<div className="mx-auto max-w-6xl px-6">
						<SectionHead title="เว็บตัวอย่าง">
							สองร้านนี้เป็นร้านสมมติ ลองเปิดบนมือถือแล้วกดดูได้เลย เว็บร้านคุณจะใช้รูป เมนู
							และสีของร้านคุณเอง
						</SectionHead>
						<div className="grid gap-5 md:grid-cols-2">
							{examples.map((e) => (
								<a key={e.href} href={e.href} className="group">
									<Card className="transition-shadow group-hover:shadow-lg">
										<img
											src={e.img}
											alt={e.alt}
											loading="lazy"
											className="aspect-video w-full object-cover"
										/>
										<CardHeader>
											<CardTitle className="font-semibold">{e.name}</CardTitle>
											<CardDescription>{e.desc}</CardDescription>
											<CardAction>
												<ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
											</CardAction>
										</CardHeader>
									</Card>
								</a>
							))}
						</div>
					</div>
				</section>

				<section id="pricing" className="border-t py-16 md:py-24">
					<div className="mx-auto max-w-6xl px-6">
						<SectionHead title="ราคาเดียวจบ ไม่มีรายเดือนบังคับ">
							มัดจำครึ่งเดียวเมื่อพอใจตัวอย่าง ที่เหลือจ่ายตอนงานเสร็จ ผ่านพร้อมเพย์หรือโอนบัญชี
							{on &&
								` โปรเปิดตัวลด ${baht(promo.discount)} บาท ใช้ได้ถึง ${promo.endsLabel} หรือจนครบ ${promo.slotsTotal} ร้าน`}
						</SectionHead>
						<div className="grid gap-5 lg:grid-cols-3">
							{plans.map((p) => {
								const price = priceNow(p.regular, p.discountable, promo);
								const deal = price < p.regular;
								return (
									<Card
										key={p.name}
										className={cn(
											p.featured && "ring-2 ring-primary shadow-xl",
										)}
									>
										<CardHeader>
											<div className="flex items-center justify-between gap-3">
												<CardTitle className="font-semibold">
													{p.name}
												</CardTitle>
												<div className="flex gap-1.5">
													{deal && (
														<Badge variant="destructive">
															ลด {baht(promo.discount)}
														</Badge>
													)}
													{p.featured && <Badge>คุ้มที่สุด</Badge>}
												</div>
											</div>
											<CardDescription>{p.desc}</CardDescription>
											<div className="mt-4 flex items-baseline gap-1.5 tabular-nums">
												<span className="text-4xl font-bold tracking-tight">
													{baht(price)}
												</span>
												<span className="text-sm text-muted-foreground">
													{p.unit}
												</span>
												{deal && (
													<s className="text-sm text-muted-foreground">
														{baht(p.regular)}
													</s>
												)}
											</div>
										</CardHeader>
										<CardContent className="flex-1">
											<Checks items={p.items} className="border-t pt-6" />
										</CardContent>
										<CardFooter>
											<ContactLink
												plan={`${p.name} ${baht(price)}${deal ? " (โปรเปิดตัว)" : ""}`}
												className={btn({
													variant: p.featured ? "default" : "outline",
													className: "w-full",
												})}
											>
												{p.cta}
											</ContactLink>
										</CardFooter>
									</Card>
								);
							})}
						</div>
						<p className="mt-5 text-sm text-muted-foreground">
							ร้านที่มีลูกค้าต่างชาติ เพิ่มเว็บภาษาอังกฤษได้ +990 บาท
						</p>
					</div>
				</section>

				<section className="border-t bg-muted/40 py-16 md:py-24">
					<div className="mx-auto max-w-6xl px-6">
						<SectionHead title="ขั้นตอน ตั้งแต่ทักจนเสร็จ" />
						<ol className="grid gap-8 md:grid-cols-4">
							{steps.map(([title, desc], i) => (
								<li key={title}>
									<span className="mb-4 grid size-8 place-items-center rounded-full border bg-background text-sm font-semibold">
										{i + 1}
									</span>
									<p className="leading-snug font-semibold">{title}</p>
									<p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
								</li>
							))}
						</ol>
					</div>
				</section>

				<section id="faq" className="border-t py-16 md:py-24">
					<div className="mx-auto max-w-6xl px-6">
						<SectionHead title="คำถามที่พบบ่อย" />
						<Accordion className="max-w-3xl">
							{faqs.map(([q, a]) => (
								<AccordionItem key={q} value={q}>
									<AccordionTrigger className="text-base">{q}</AccordionTrigger>
									<AccordionContent className="text-muted-foreground">
										{a}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</section>

				<section id="contact" className="border-t py-16 md:py-24">
					<div className="mx-auto max-w-6xl px-6">
						<Card className="items-center bg-muted/50 px-6 py-14 text-center shadow-none">
							<h2 className="text-2xl leading-tight font-bold tracking-tight text-balance md:text-3xl">
								ส่งชื่อร้านมา รับผลเช็กร้านฟรีใน 24 ชั่วโมง
							</h2>
							<p className="max-w-xl text-base text-muted-foreground">
								บอกชื่อร้านกับลิงก์เพจ Facebook หรือ Instagram เราเช็กว่าหมุด Google Maps
								กับ LINE ของร้านคุณขาดอะไร พร้อมทำตัวอย่างเว็บร้านให้ดู
								ไม่มีค่าใช้จ่ายและไม่ผูกมัด
							</p>
							<div className="mt-4">
								<ContactButtons />
							</div>
						</Card>
					</div>
				</section>
			</main>

			<footer className="border-t pt-7 pb-28 text-sm text-muted-foreground md:pb-7">
				<div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-6">
					<span>© {new Date().getFullYear()} หาเจอ</span>
					<span>รูปในเว็บตัวอย่างเป็นภาพสต็อกใช้ฟรี (CC0)</span>
				</div>
			</footer>

			<div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
				<ContactLink className={btn({ size: "lg", className: "w-full" })}>
					เช็กร้านคุณฟรี
				</ContactLink>
			</div>
		</>
	);
}
