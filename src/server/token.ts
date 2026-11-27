import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const newToken = () => randomBytes(18).toString("base64url");
export const hashToken = (t: string) =>
	createHash("sha256").update(t).digest("hex");

const same = (a: string, b: string) => {
	const x = Buffer.from(a);
	const y = Buffer.from(b);
	return x.length === y.length && timingSafeEqual(x, y);
};

export const tokenMatches = (token: unknown, hash: string) =>
	typeof token === "string" && token.length > 0 && same(hashToken(token), hash);

// Admin pages are off unless ADMIN_TOKEN is set
export const isAdmin = (k: unknown) =>
	!!process.env.ADMIN_TOKEN &&
	typeof k === "string" &&
	same(k, process.env.ADMIN_TOKEN);
