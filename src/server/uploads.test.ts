import assert from "node:assert/strict";
import { test } from "node:test";
import { sniffImage, UPLOAD_PATH } from "./uploads.ts";

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
