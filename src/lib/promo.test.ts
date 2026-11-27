import assert from "node:assert/strict";
import { test } from "node:test";
import { baht, priceNow, promoActive } from "./promo.ts";

const p = { discount: 1000, slotsLeft: 5, endsAt: "2026-12-31T23:59:59+07:00" };
const before = new Date("2026-11-27T12:00:00+07:00");
const after = new Date("2027-01-01T00:00:00+07:00");

test("promo runs until the end date while slots remain", () => {
	assert.equal(promoActive(p, before), true);
	assert.equal(promoActive(p, after), false);
	assert.equal(promoActive({ ...p, slotsLeft: 0 }, before), false);
});

test("discount applies only to discountable packages during the promo", () => {
	assert.equal(priceNow(2990, true, p, before), 1990);
	assert.equal(priceNow(2990, true, p, after), 2990);
	assert.equal(priceNow(490, false, p, before), 490);
	assert.equal(baht(4990), "4,990");
});
