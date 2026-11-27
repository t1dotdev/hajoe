import assert from "node:assert/strict";
import { test } from "node:test";
import { contactHref, lineHref, messengerHref } from "./contact.ts";

test("messenger link from both Facebook URL shapes", () => {
	assert.equal(
		messengerHref("https://www.facebook.com/profile.php?id=61596774640090"),
		"https://m.me/61596774640090",
	);
	assert.equal(
		messengerHref("https://facebook.com/hajoe.th/"),
		"https://m.me/hajoe.th",
	);
	assert.equal(messengerHref(""), "");
});

test("LINE link encodes the @ id and the message", () => {
	assert.equal(
		lineHref("@322icmtg", "a b"),
		"https://line.me/R/oaMessage/%40322icmtg/?a%20b",
	);
	assert.equal(lineHref("", "x"), "");
});

test("contact falls back LINE -> Messenger -> #contact", () => {
	const none = { line: "", phone: "", facebook: "", email: "" };
	assert.match(
		contactHref({ ...none, line: "@x" }, "plan"),
		/^https:\/\/line\.me\/R\/oaMessage\/%40x\/\?/,
	);
	assert.equal(
		contactHref({ ...none, facebook: "https://facebook.com/p" }),
		"https://m.me/p",
	);
	assert.equal(contactHref(none), "#contact");
});
