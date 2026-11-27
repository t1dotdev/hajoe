import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	BRAND_PRESETS,
	brandOf,
	DAY_TH,
	type Range,
	type ShopData,
	WEEK,
} from "@/lib/shop";
import { saveShop } from "@/server/shops";

function Field({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: (id: string) => ReactNode;
}) {
	const id = useId();
	return (
		<div className="grid gap-1.5">
			<Label htmlFor={id}>{label}</Label>
			{children(id)}
			{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
		</div>
	);
}

function Section({
	title,
	desc,
	children,
}: {
	title: string;
	desc?: string;
	children: ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-semibold">{title}</CardTitle>
				{desc && <CardDescription>{desc}</CardDescription>}
			</CardHeader>
			<CardContent className="grid gap-4">{children}</CardContent>
		</Card>
	);
}

// Shrink photos in the browser so uploads stay small on mobile data
async function resizeImage(file: File, max = 1600): Promise<Blob> {
	const bmp = await createImageBitmap(file);
	const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
	const canvas = document.createElement("canvas");
	canvas.width = Math.round(bmp.width * scale);
	canvas.height = Math.round(bmp.height * scale);
	canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
	const encode = (type: string, q: number) =>
		new Promise<Blob | null>((res) => canvas.toBlob(res, type, q));
	const webp = await encode("image/webp", 0.82);
	// older Safari can't encode WebP and silently returns PNG; JPEG is much smaller then
	if (webp && webp.type === "image/webp") return webp;
	return (await encode("image/jpeg", 0.85)) ?? file;
}

async function upload(slug: string, k: string, file: File) {
	const form = new FormData();
	form.set("slug", slug);
	form.set("k", k);
	form.set("file", await resizeImage(file));
	const res = await fetch("/api/upload", { method: "POST", body: form });
	const body = (await res.json().catch(() => ({}))) as {
		src?: string;
		error?: string;
	};
	if (!res.ok || !body.src) throw new Error(body.error || "อัปโหลดรูปไม่สำเร็จ");
	return body.src;
}

export function ShopEditor({
	slug,
	k,
	initial,
}: {
	slug: string;
	k: string;
	initial: ShopData;
}) {
	const [shop, setShop] = useState<ShopData>(initial);
	const [dirty, setDirty] = useState(false);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [saved, setSaved] = useState(false);
	const heroInput = useRef<HTMLInputElement>(null);
	const galleryInput = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!dirty) return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);

	const update = (patch: Partial<ShopData>) => {
		setShop((s) => ({ ...s, ...patch }));
		setDirty(true);
		setSaved(false);
	};
	const text = (key: keyof ShopData) => ({
		value: (shop[key] as string | undefined) ?? "",
		onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			update({ [key]: e.target.value } as Partial<ShopData>),
	});

	const setDay = (d: (typeof WEEK)[number], ranges: Range[]) =>
		update({ hours: { ...shop.hours, [d]: ranges } });
	const menu = shop.menu ?? [];
	const setMenu = (m: NonNullable<ShopData["menu"]>) => update({ menu: m });
	const gallery = shop.gallery ?? [];

	const onUpload = async (
		files: FileList | null,
		target: "hero" | "gallery",
	) => {
		if (!files?.length) return;
		setUploading(true);
		setErrors([]);
		try {
			if (target === "hero") update({ hero: await upload(slug, k, files[0]) });
			else {
				const room = 12 - gallery.length;
				const added = [];
				for (const f of [...files].slice(0, room))
					added.push({ src: await upload(slug, k, f) });
				update({ gallery: [...gallery, ...added] });
			}
		} catch (e) {
			setErrors([(e as Error).message]);
		} finally {
			setUploading(false);
			if (heroInput.current) heroInput.current.value = "";
			if (galleryInput.current) galleryInput.current.value = "";
		}
	};

	const save = async () => {
		setSaving(true);
		setErrors([]);
		try {
			const res = await saveShop({ data: { slug, k, shop } });
			if (res.ok) {
				setDirty(false);
				setSaved(true);
			} else setErrors(res.errors);
		} catch (e) {
			setErrors([(e as Error).message || "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง"]);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="grid gap-4 pb-28">
			<Section title="ข้อมูลร้าน">
				<Field label="ชื่อร้าน">
					{(id) => <Input id={id} maxLength={80} {...text("name")} />}
				</Field>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="ประเภทร้าน" hint="เช่น คาเฟ่ ร้านนวด คาร์แคร์">
						{(id) => <Input id={id} maxLength={60} {...text("category")} />}
					</Field>
					<Field label="ย่าน" hint="เช่น นิมมาน เชียงใหม่">
						{(id) => <Input id={id} maxLength={60} {...text("area")} />}
					</Field>
				</div>
				<Field label="คำโปรยสั้น ๆ" hint="แสดงใต้ชื่อร้าน และในผลค้นหา Google">
					{(id) => <Input id={id} maxLength={160} {...text("tagline")} />}
				</Field>
				<Field label="เกี่ยวกับร้าน" hint="ขึ้นบรรทัดใหม่เพื่อแบ่งย่อหน้า">
					{(id) => (
						<Textarea id={id} rows={4} maxLength={2000} {...text("about")} />
					)}
				</Field>
				<Field label="จุดเด่นของร้าน" hint="บรรทัดละหนึ่งข้อ เช่น ที่จอดรถ, Wi-Fi ฟรี">
					{(id) => (
						<Textarea
							id={id}
							rows={3}
							value={(shop.highlights ?? []).join("\n")}
							onChange={(e) =>
								update({ highlights: e.target.value.split("\n") })
							}
						/>
					)}
				</Field>
				<Field label="ช่วงราคา" hint="เช่น ฿ หรือ ฿฿">
					{(id) => (
						<Input
							id={id}
							maxLength={20}
							className="max-w-32"
							{...text("priceRange")}
						/>
					)}
				</Field>
			</Section>

			<Section
				title="ติดต่อและที่ตั้ง"
				desc="ใส่เบอร์โทรหรือ LINE อย่างน้อยหนึ่งช่อง ปุ่มบนหน้าร้านจะใช้ข้อมูลนี้"
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="เบอร์โทร">
						{(id) => (
							<Input id={id} type="tel" inputMode="tel" {...text("phone")} />
						)}
					</Field>
					<Field label="LINE ID" hint="เช่น @ร้านของคุณ">
						{(id) => <Input id={id} {...text("line")} />}
					</Field>
					<Field label="ลิงก์ Facebook">
						{(id) => (
							<Input
								id={id}
								type="url"
								placeholder="https://facebook.com/..."
								{...text("facebook")}
							/>
						)}
					</Field>
					<Field label="ลิงก์ Instagram">
						{(id) => (
							<Input
								id={id}
								type="url"
								placeholder="https://instagram.com/..."
								{...text("instagram")}
							/>
						)}
					</Field>
				</div>
				<Field label="ที่อยู่ร้าน">
					{(id) => (
						<Textarea id={id} rows={2} maxLength={300} {...text("address")} />
					)}
				</Field>
				<Field
					label="ชื่อที่ใช้ค้นใน Google Maps"
					hint="ถ้าปุ่มนำทางพาไปผิดที่ ใส่ชื่อร้านตามที่ขึ้นใน Google Maps"
				>
					{(id) => <Input id={id} maxLength={200} {...text("mapsQuery")} />}
				</Field>
			</Section>

			<Section title="เวลาเปิด–ปิด">
				<ul className="grid gap-2">
					{WEEK.map((d) => {
						const ranges = shop.hours[d] ?? [];
						const open = ranges.length > 0;
						const [a, b] = ranges[0] ?? ["09:00", "18:00"];
						return (
							<li key={d} className="flex flex-wrap items-center gap-3">
								<span className="w-20 text-sm font-medium">{DAY_TH[d]}</span>
								<Switch
									checked={open}
									onCheckedChange={(on) =>
										setDay(d, on ? [["09:00", "18:00"]] : [])
									}
									aria-label={`เปิดวัน${DAY_TH[d]}`}
								/>
								{open ? (
									<span className="flex items-center gap-2">
										<Input
											type="time"
											value={a}
											aria-label={`เวลาเปิดวัน${DAY_TH[d]}`}
											onChange={(e) =>
												setDay(d, [[e.target.value, b], ...ranges.slice(1)])
											}
											className="w-28"
										/>
										–
										<Input
											type="time"
											value={b}
											aria-label={`เวลาปิดวัน${DAY_TH[d]}`}
											onChange={(e) =>
												setDay(d, [[a, e.target.value], ...ranges.slice(1)])
											}
											className="w-28"
										/>
									</span>
								) : (
									<span className="text-sm text-muted-foreground">ปิดทั้งวัน</span>
								)}
							</li>
						);
					})}
				</ul>
			</Section>

			<Section
				title="เมนูและราคา"
				desc="แบ่งเป็นหมวด เช่น กาแฟ ขนม หรือ นวดไทย นวดน้ำมัน"
			>
				<Field label="หัวข้อส่วนนี้" hint="ค่าเริ่มต้นคือ เมนูและราคา">
					{(id) => <Input id={id} maxLength={60} {...text("menuTitle")} />}
				</Field>
				{menu.map((g, gi) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: rows have no id; inputs are controlled, so index keys stay correct
					<div key={gi} className="grid gap-3 rounded-2xl border p-3">
						<div className="flex items-center gap-2">
							<Input
								aria-label="ชื่อหมวด"
								placeholder="ชื่อหมวด"
								value={g.group}
								onChange={(e) =>
									setMenu(
										menu.map((x, i) =>
											i === gi ? { ...x, group: e.target.value } : x,
										),
									)
								}
								className="font-semibold"
							/>
							<Button
								variant="ghost"
								size="icon"
								aria-label={`ลบหมวด ${g.group}`}
								onClick={() => setMenu(menu.filter((_, i) => i !== gi))}
							>
								<Trash2 />
							</Button>
						</div>
						{g.items.map((it, ii) => {
							const setItem = (patch: Partial<typeof it>) =>
								setMenu(
									menu.map((x, i) =>
										i === gi
											? {
													...x,
													items: x.items.map((y, j) =>
														j === ii ? { ...y, ...patch } : y,
													),
												}
											: x,
									),
								);
							return (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: rows have no id; inputs are controlled, so index keys stay correct
									key={ii}
									className="grid grid-cols-[1fr_6.5rem_auto] gap-2"
								>
									<Input
										aria-label="ชื่อรายการ"
										placeholder="ชื่อรายการ"
										value={it.name}
										onChange={(e) => setItem({ name: e.target.value })}
									/>
									<Input
										aria-label="ราคา"
										placeholder="ราคา"
										value={it.price ?? ""}
										onChange={(e) => setItem({ price: e.target.value })}
									/>
									<Button
										variant="ghost"
										size="icon"
										aria-label={`ลบ ${it.name}`}
										onClick={() =>
											setMenu(
												menu.map((x, i) =>
													i === gi
														? {
																...x,
																items: x.items.filter((_, j) => j !== ii),
															}
														: x,
												),
											)
										}
									>
										<X />
									</Button>
									<Input
										aria-label="รายละเอียด"
										placeholder="รายละเอียด (ไม่ใส่ก็ได้)"
										value={it.desc ?? ""}
										onChange={(e) => setItem({ desc: e.target.value })}
										className="col-span-2 text-muted-foreground"
									/>
								</div>
							);
						})}
						<Button
							variant="outline"
							size="sm"
							className="justify-self-start"
							onClick={() =>
								setMenu(
									menu.map((x, i) =>
										i === gi
											? { ...x, items: [...x.items, { name: "", price: "" }] }
											: x,
									),
								)
							}
						>
							<Plus /> เพิ่มรายการ
						</Button>
					</div>
				))}
				<Button
					variant="outline"
					className="justify-self-start"
					onClick={() =>
						setMenu([...menu, { group: "", items: [{ name: "", price: "" }] }])
					}
				>
					<Plus /> เพิ่มหมวด
				</Button>
			</Section>

			<Section title="รูปภาพ" desc="รูปจะถูกย่อให้เล็กลงอัตโนมัติก่อนอัปโหลด">
				<div className="grid gap-2">
					<Label>รูปหน้าปก</Label>
					<div className="relative overflow-hidden rounded-2xl border">
						<img
							src={shop.hero}
							alt=""
							className="aspect-video w-full object-cover"
						/>
						<Button
							variant="secondary"
							size="sm"
							className="absolute right-3 bottom-3"
							disabled={uploading}
							onClick={() => heroInput.current?.click()}
						>
							<ImagePlus /> เปลี่ยนรูป
						</Button>
					</div>
					<input
						ref={heroInput}
						type="file"
						accept="image/*"
						hidden
						onChange={(e) => onUpload(e.target.files, "hero")}
					/>
				</div>
				<div className="grid gap-2">
					<Label>รูปบรรยากาศร้าน ({gallery.length}/12)</Label>
					<div className="grid grid-cols-3 gap-2">
						{gallery.map((p, i) => (
							<div key={p.src} className="relative">
								<img
									src={p.src}
									alt={p.alt || ""}
									className="aspect-square w-full rounded-xl object-cover"
								/>
								<button
									type="button"
									aria-label="ลบรูปนี้"
									onClick={() =>
										update({ gallery: gallery.filter((_, j) => j !== i) })
									}
									className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white"
								>
									<X className="size-4" />
								</button>
							</div>
						))}
						{gallery.length < 12 && (
							<button
								type="button"
								disabled={uploading}
								onClick={() => galleryInput.current?.click()}
								className="grid aspect-square place-items-center rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-muted"
							>
								{uploading ? (
									<Loader2 className="size-5 animate-spin" />
								) : (
									<ImagePlus className="size-5" />
								)}
							</button>
						)}
					</div>
					<input
						ref={galleryInput}
						type="file"
						accept="image/*"
						multiple
						hidden
						onChange={(e) => onUpload(e.target.files, "gallery")}
					/>
				</div>
			</Section>

			<Section title="สีร้าน" desc="ใช้กับปุ่มและราคาบนหน้าร้าน">
				<fieldset className="flex flex-wrap gap-3">
					<legend className="sr-only">สีร้าน</legend>
					{BRAND_PRESETS.map((c) => (
						<label key={c} className="cursor-pointer">
							<input
								type="radio"
								name="brand"
								value={c}
								checked={brandOf(shop) === c}
								onChange={() => update({ theme: { brand: c } })}
								className="peer sr-only"
								aria-label={c}
							/>
							<span
								className="block size-10 rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
								style={{ background: c }}
							/>
						</label>
					))}
				</fieldset>
			</Section>

			<div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur-md">
				<div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
					<Button
						size="lg"
						onClick={save}
						disabled={saving || uploading || !dirty}
					>
						{saving && <Loader2 className="animate-spin" />}
						{saving ? "กำลังบันทึก" : "บันทึก"}
					</Button>
					<div className="min-w-0 flex-1 text-sm" aria-live="polite">
						{errors.length > 0 ? (
							<span className="text-destructive">{errors.join(" · ")}</span>
						) : saved ? (
							<span>
								บันทึกแล้ว{" "}
								<a
									href={`/s/${slug}`}
									target="_blank"
									rel="noopener"
									className="font-medium underline underline-offset-4"
								>
									ดูหน้าร้าน
								</a>
							</span>
						) : dirty ? (
							<span className="text-muted-foreground">ยังไม่ได้บันทึก</span>
						) : (
							<span className="text-muted-foreground">
								แก้แล้วกดบันทึก หน้าร้านจะเปลี่ยนทันที
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
