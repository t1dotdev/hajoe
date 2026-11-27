export type Contact = {
	line: string;
	phone: string;
	facebook: string;
	email: string;
};

export const greeting = (plan?: string) =>
	`สวัสดีครับ ${plan ? `สนใจแพ็ก ${plan}` : "ขอเช็กร้านฟรี"} ร้านชื่อ: \nลิงก์เพจร้าน (ถ้ามี): `;

// LINE deep link that opens a chat with the OA and a pre-filled message
export const lineHref = (id: string, text: string) =>
	id
		? `https://line.me/R/oaMessage/${encodeURIComponent(id)}/?${encodeURIComponent(text)}`
		: "";

// facebook.com/profile.php?id=N -> m.me/N, facebook.com/name -> m.me/name
export const messengerHref = (pageUrl: string) => {
	if (!pageUrl) return "";
	const url = new URL(pageUrl);
	return `https://m.me/${url.searchParams.get("id") || url.pathname.split("/").filter(Boolean)[0]}`;
};

// Where "check my shop" and plan buttons go: LINE first, then Messenger, else the contact section
export const contactHref = (c: Contact, plan?: string) =>
	lineHref(c.line, greeting(plan)) || messengerHref(c.facebook) || "#contact";
