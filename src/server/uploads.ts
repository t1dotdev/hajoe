import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { SLUG } from "../lib/shop.ts";
import { newToken } from "./token.ts";

export const uploadDir = () =>
	resolve(process.env.UPLOAD_DIR ?? ".data/uploads");
export const MAX_UPLOAD = 3 * 1024 * 1024;

// Trust the bytes, not the browser's content type
export function sniffImage(b: Uint8Array): "jpg" | "png" | "webp" | null {
	if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
	if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
		return "png";
	const ascii = (i: number, n: number) =>
		String.fromCharCode(...b.slice(i, i + n));
	if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "webp";
	return null;
}

export async function saveUpload(slug: string, bytes: Uint8Array, ext: string) {
	const dir = join(uploadDir(), slug);
	await mkdir(dir, { recursive: true });
	const name = `${newToken()}.${ext}`;
	await writeFile(join(dir, name), bytes);
	// shortcut: replaced/removed photos stay on disk; add a cleanup job if the volume fills up
	return `/u/${slug}/${name}`;
}

export const UPLOAD_PATH = /^([a-z0-9-]+)\/([A-Za-z0-9_-]+)\.(jpg|png|webp)$/;
export const readUpload = (path: string) => readFile(join(uploadDir(), path));

// Deletes every photo a shop uploaded. The slug check keeps the path inside the upload dir.
export async function removeShopUploads(slug: string) {
	if (!SLUG.test(slug)) throw new Error("bad slug");
	const dir = join(uploadDir(), slug);
	await rm(dir, { recursive: true, force: true });
	return dir;
}
