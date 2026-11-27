// Contact channels shown on the landing page. Leave a value "" to hide that button.
// They are rendered into the HTML on the server, so a push + redeploy is all a change needs.
export const contact = {
	line: "@322icmtg", // LINE OA basic ID
	phone: "", // e.g. "0812345678", shown as a call button
	facebook: "https://www.facebook.com/profile.php?id=61596774640090", // Facebook page URL
	email: "", // business email only, never a personal one
};

// Launch promo: ฿1,000 off the two setup packages. It switches itself off when slotsLeft
// reaches 0 or endsAt passes, and the site then shows regular prices.
// Each time a shop pays its deposit: lower slotsLeft by 1 and push.
export const promo = {
	discount: 1000,
	slotsTotal: 5,
	slotsLeft: 5,
	endsAt: "2026-12-31T23:59:59+07:00",
	endsLabel: "31 ธ.ค. 2569",
};

export const siteUrl = "https://hajoe.topone.dev";
