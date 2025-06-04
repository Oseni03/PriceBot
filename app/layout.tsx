import type { Metadata } from "next";
import "./globals.css";
import { setupWebhook } from "@/lib/telegramBot";
import logger from "@/lib/logger";
import { initializeServices } from "@/lib/init";

// Server-side initialization
setupWebhook().catch((error) => {
	logger.error("Failed to setup Telegram webhook:", error);
});

initializeServices().catch((error) => {
	logger.error("Failed to initialize services:", error);
});

export const metadata: Metadata = {
	title: "Morphe AI - E-commerce Multi-Platform AI Shopper",
	description: "Morphe AI - E-commerce Multi-Platform AI Shopper",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
