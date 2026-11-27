import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { removeShopUploads, sniffImage, UPLOAD_PATH } from "./uploads.ts";

test("sniffs image types from bytes", () => {
	assert.equal(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "jpg");
	assert.equal(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), "png");
	assert.equal(
		sniffImage(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ")),
		"webp",
	);
	assert.equal(
		sniffImage(new TextEncoder().encode("<svg onload=alert(1)>")),
		null,
	);
});

test("upload paths cannot escape the upload dir", () => {
	assert.ok(UPLOAD_PATH.test("demo-cafe/abc_DEF-1.webp"));
	assert.ok(!UPLOAD_PATH.test("../etc/passwd"));
	assert.ok(!UPLOAD_PATH.test("demo-cafe/../../x.webp"));
	assert.ok(!UPLOAD_PATH.test("demo-cafe/x.html"));
});

test("removeShopUploads deletes only that shop's folder", async () => {
	const root = mkdtempSync(join(tmpdir(), "hajoe-up-"));
	process.env.UPLOAD_DIR = root;
	for (const shop of ["gone", "kept"]) {
		mkdirSync(join(root, shop));
		writeFileSync(join(root, shop, "a.webp"), "x");
	}
	await removeShopUploads("gone");
	assert.equal(existsSync(join(root, "gone")), false);
	assert.equal(existsSync(join(root, "kept", "a.webp")), true);
	await removeShopUploads("never-uploaded"); // missing folder is fine
	await assert.rejects(removeShopUploads(".."));
	await assert.rejects(removeShopUploads("kept/../.."));
	assert.equal(existsSync(join(root, "kept")), true);
});
