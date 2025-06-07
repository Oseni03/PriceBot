import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { COOKIE_NAME } from "@/lib/constants";
import { getUser } from "@/services/user";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const authToken = cookieStore.get(COOKIE_NAME)?.value;

		if (!authToken) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const decodedToken = await verifyAuthToken(authToken).catch(() => null);
		if (!decodedToken?.uid) {
			return NextResponse.json(
				{ error: "Invalid or expired authentication token" },
				{ status: 401 }
			);
		}

		// Get user and their platform integrations
		const user = await getUser(decodedToken.uid);

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
