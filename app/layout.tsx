import type { Metadata } from "next";
import "./globals.css";
import { setupWebhook } from "@/lib/telegramBot";
import logger from "@/lib/logger";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

// Server-side initialization
setupWebhook().catch((error) => {
	logger.error("Failed to setup Telegram webhook:", error);
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
			<body>
				<AuthProvider>
					{children}
					<Toaster />
				</AuthProvider>
			</body>
		</html>
	);
}
