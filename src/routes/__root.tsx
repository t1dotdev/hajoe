import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";

const title = "หาเจอ — ปักหมุด Google Maps และตั้งค่า LINE OA ให้ร้านคุณ เริ่ม 1,990 บาท";
const description =
	"ปักหมุด Google Maps และตั้งค่า LINE OA ให้ลูกค้าหาร้านเจอแล้วทักได้ทันที เริ่ม 1,990 บาท เสร็จใน 48 ชั่วโมง เช็กร้านคุณฟรีก่อนตัดสินใจ";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title },
			{ name: "description", content: description },
			{ property: "og:title", content: "หาเจอ — ให้ลูกค้าหาร้านคุณเจอ ใน 48 ชั่วโมง" },
			{
				property: "og:description",
				content: "ปักหมุด Google Maps + LINE OA เริ่ม 1,990 บาท เช็กร้านคุณฟรี",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: "https://hajoe.topone.dev" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="th">
			<head>
				<HeadContent />
			</head>
			<body className="antialiased">
				{children}
				<Scripts />
			</body>
		</html>
	);
}
