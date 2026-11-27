import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { cleanShop, jsonLd, openStatus, SLUG, shopErrors } from "./shop.ts";

const cafe = JSON.parse(
	readFileSync(new URL("../../shops/demo-cafe.json", import.meta.url), "utf8"),
);

test("demo shop data is valid after cleaning", () => {
	assert.deepEqual(shopErrors(cleanShop(cafe)), []);
});

test("cleanShop drops unknown fields and caps lengths", () => {
	const s = cleanShop({ ...cafe, evil: "<script>", name: "x".repeat(500) });
	assert.equal("evil" in s, false);
	assert.equal(s.name.length, 80);
});

test("rejects unsafe image and link values", () => {
	const s = cleanShop({
		...cafe,
		hero: "javascript:alert(1)",
		facebook: "javascript:alert(1)",
		demo: false,
	});
	const e = shopErrors(s);
	assert.ok(e.includes("รูปหน้าปกไม่ถูกต้อง"));
	assert.ok(e.includes("ลิงก์ Facebook ไม่ถูกต้อง"));
});

test("hours must be HH:MM and close after open", () => {
	assert.ok(
		shopErrors(
			cleanShop({ ...cafe, hours: { mon: [["9:00", "17:00"]] } }),
		).some((m) => m.includes("09:00")),
	);
	assert.ok(
		shopErrors(
			cleanShop({ ...cafe, hours: { mon: [["18:00", "02:00"]] } }),
		).some((m) => m.includes("หลัง")),
	);
});

test("a real shop needs a phone or LINE", () => {
	const s = cleanShop({ ...cafe, demo: false, phone: "", line: "" });
	assert.ok(shopErrors(s).includes("ใส่เบอร์โทรหรือ LINE อย่างน้อยหนึ่งช่อง"));
});

test("open status in Bangkok time", () => {
	const hours = {
		mon: [["09:00", "17:00"]] as [string, string][],
		tue: [["10:00", "18:00"]] as [string, string][],
	};
	// Monday 2026-11-30 10:00 Bangkok = 03:00 UTC
	assert.equal(
		openStatus(hours, new Date("2026-11-30T03:00:00Z")).text,
		"เปิดอยู่ · ปิด 17:00 น.",
	);
	// Monday 18:00 Bangkok
	assert.equal(
		openStatus(hours, new Date("2026-11-30T11:00:00Z")).text,
		"ปิดอยู่ · เปิดพรุ่งนี้ 10:00 น.",
	);
	// Monday 07:00 Bangkok
	assert.equal(
		openStatus(hours, new Date("2026-11-30T00:00:00Z")).text,
		"ปิดอยู่ · เปิดวันนี้ 09:00 น.",
	);
});

test("JSON-LD escapes < and uses absolute image URLs", () => {
	const ld = jsonLd(
		cleanShop({ ...cafe, name: "</script>" }),
		"https://hajoe.topone.dev/s/x",
	);
	assert.ok(!ld.includes("</script>"));
	assert.match(ld, /"image":"https:\/\/hajoe\.topone\.dev\//);
});

test("slug format", () => {
	assert.ok(SLUG.test("demo-cafe"));
	assert.ok(!SLUG.test("-bad"));
	assert.ok(!SLUG.test("Bad"));
	assert.ok(!SLUG.test("a/b"));
});
