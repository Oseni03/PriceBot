import type { Metadata } from "next";
import "./globals.css";
import { setupWebhook } from "@/lib/telegramBot";
import { UserProvider } from "@/lib/context/UserContext";
import logger from "@/lib/logger";

// Server-side initialization
if (process.env.NODE_ENV === "production") {
	setupWebhook().catch((error) => {
		logger.error("Failed to setup Telegram webhook:", error);
	});
}

export const metadata: Metadata = {
	title: "PriceMorph - Telegram E-commerce Price Tracker",
	description: "PriceMorph - Telegram E-commerce Price Tracker",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<UserProvider>{children}</UserProvider>
			</body>
		</html>
	);
}
