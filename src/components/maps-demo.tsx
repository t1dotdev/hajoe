import {
	Globe,
	MapPin,
	MessageCircle,
	Navigation,
	Phone,
	Search,
	Star,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type View = "before" | "after";

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
	return (
		<span className="inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-medium [&_svg]:size-3">
			{icon}
			{children}
		</span>
	);
}

function Others() {
	return (
		<>
			<div className="grid grid-cols-[56px_1fr] gap-3 border-t p-3.5">
				<div className="size-14 rounded-xl bg-muted" />
				<div>
					<p className="text-sm font-semibold">คาเฟ่ร้านอื่น A</p>
					<p className="text-xs text-muted-foreground">
						4.3 · <span className="font-medium text-emerald-600">เปิดอยู่</span> ·
						600 ม.
					</p>
					<div className="mt-2 flex flex-wrap gap-1.5">
						<Chip icon={<Phone />}>โทร</Chip>
						<Chip icon={<Navigation />}>เส้นทาง</Chip>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-[56px_1fr] gap-3 border-t p-3.5">
				<div className="size-14 rounded-xl bg-muted" />
				<div>
					<p className="text-sm font-semibold">คาเฟ่ร้านอื่น B</p>
					<p className="text-xs text-muted-foreground">4.0 · 800 ม.</p>
					<div className="mt-2 flex flex-wrap gap-1.5">
						<Chip icon={<Navigation />}>เส้นทาง</Chip>
					</div>
				</div>
			</div>
		</>
	);
}

function YourShop({ name, view }: { name: string; view: View }) {
	if (view === "before") {
		return (
			<div className="grid grid-cols-[56px_1fr] gap-3 border-t p-3.5">
				<div className="size-14 rounded-xl bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_5px,#fff_5px,#fff_10px)]" />
				<div>
					<p className="text-sm font-semibold text-muted-foreground">{name}</p>
					<p className="text-xs text-muted-foreground">
						ไม่มีรูป · ไม่มีเวลาเปิด · ไม่มีเบอร์
					</p>
				</div>
			</div>
		);
	}
	return (
		<div className="grid grid-cols-[56px_1fr] gap-3 bg-gradient-to-r from-muted to-transparent p-3.5">
			<img
				src="/demo/img/cafe-overhead.webp"
				alt=""
				className="size-14 rounded-xl object-cover"
			/>
			<div>
				<p className="text-sm font-semibold">{name}</p>
				<p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
					4.8
					<span
						className="inline-flex text-amber-500"
						role="img"
						aria-label="4.8 ดาว"
					>
						{[1, 2, 3, 4, 5].map((n) => (
							<Star key={n} className="size-3 fill-current" />
						))}
					</span>
					· <span className="font-medium text-emerald-600">เปิดอยู่</span> · ปิด
					18:00
				</p>
				<div className="mt-2 flex flex-wrap gap-1.5">
					<Chip icon={<Phone />}>โทร</Chip>
					<Chip icon={<Navigation />}>เส้นทาง</Chip>
					<Chip icon={<Globe />}>เว็บไซต์</Chip>
					<Chip icon={<MessageCircle />}>LINE</Chip>
				</div>
			</div>
		</div>
	);
}

function Results({ name, view }: { name: string; view: View }) {
	const you = <YourShop name={name} view={view} />;
	return (
		<Card className="gap-0 py-0">
			<div className="m-3 flex h-10 items-center gap-2 rounded-full border px-4 text-sm text-muted-foreground">
				<Search className="size-4" />
				คาเฟ่ใกล้ฉัน
			</div>
			<div
				aria-hidden="true"
				className="relative h-28 border-y bg-[#ececec] bg-[linear-gradient(90deg,transparent_47%,#fff_47%,#fff_52%,transparent_52%),linear-gradient(0deg,transparent_45%,#fff_45%,#fff_52%,transparent_52%),linear-gradient(32deg,transparent_48%,#fff_48%,#fff_51%,transparent_51%)] bg-[length:120px_100%,100%_80px,100%_100%]"
			>
				<MapPin className="absolute top-[70%] left-[22%] size-5 -translate-x-1/2 -translate-y-full fill-neutral-300 text-neutral-400" />
				<MapPin className="absolute top-[60%] left-[80%] size-5 -translate-x-1/2 -translate-y-full fill-neutral-300 text-neutral-400" />
				<MapPin
					className={cn(
						"absolute top-[84%] left-[54%] size-8 -translate-x-1/2 -translate-y-full fill-primary text-white transition-opacity",
						view === "before" && "opacity-0",
					)}
				/>
			</div>
			{/* before: your shop sinks below the competitors; after: it leads the list */}
			{view === "after" ? (
				<>
					{you}
					<Others />
				</>
			) : (
				<>
					<div className="[&>div:first-child]:border-t-0">
						<Others />
					</div>
					{you}
				</>
			)}
		</Card>
	);
}

export function MapsDemo() {
	const [name, setName] = useState("");
	const [view, setView] = useState<View>("after");
	const shop = name.trim() || "ร้านของคุณ";

	return (
		<Tabs
			value={view}
			onValueChange={(v) => setView(v as View)}
			className="mx-auto w-full max-w-md gap-3"
		>
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div className="grid flex-[1_1_180px] gap-1.5">
					<label htmlFor="shop-name" className="text-sm font-medium">
						ลองพิมพ์ชื่อร้านคุณ
					</label>
					<Input
						id="shop-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						maxLength={40}
						placeholder="เช่น ข้าวมันไก่เจ๊หนิง"
						autoComplete="off"
					/>
				</div>
				<TabsList>
					<TabsTrigger value="before">ก่อน</TabsTrigger>
					<TabsTrigger value="after">หลังใช้หาเจอ</TabsTrigger>
				</TabsList>
			</div>
			<TabsContent value="before">
				<Results name={shop} view="before" />
			</TabsContent>
			<TabsContent value="after">
				<Results name={shop} view="after" />
			</TabsContent>
		</Tabs>
	);
}
