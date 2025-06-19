import { NextResponse } from "next/server";
import { getUser } from "@/services/user";

export async function GET() {
	try {
		const user = await getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Format the integrations data
		const integrations = [
			{
				platform: "Telegram",
				isConnected: user.platforms.some(
					(p) => p.platform === "TELEGRAM"
				),
				username: user.platforms.find((p) => p.platform === "TELEGRAM")
					?.platformId,
			},
			{
				platform: "WhatsApp",
				isConnected: user.platforms.some(
					(p) => p.platform === "WHATSAPP"
				),
				username: user.platforms.find((p) => p.platform === "WHATSAPP")
					?.platformId,
			},
		];

		return NextResponse.json({ integrations });
	} catch (error) {
		console.error("Error fetching integrations:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
