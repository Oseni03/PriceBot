import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { COOKIE_NAME } from "@/lib/constants";
import { Platform } from "@prisma/client";

export async function POST(request: NextRequest) {
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

		const body = await request.json();
		const { platform } = body;

		if (
			!platform ||
			!Object.values(Platform).includes(
				platform.toUpperCase() as Platform
			)
		) {
			return NextResponse.json(
				{ error: "Invalid platform" },
				{ status: 400 }
			);
		}

		// Generate connection URLs or handle platform-specific logic
		if (platform.toUpperCase() === "TELEGRAM") {
			return NextResponse.json({
				redirectUrl: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${decodedToken.uid}`,
			});
		}

		// For other platforms like WhatsApp, you would implement their specific connection logic here
		return NextResponse.json({
			message: "Connection initiated",
			platform,
		});
	} catch (error) {
		console.error("Error connecting platform:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const platform = searchParams.get("platform");

		if (
			!platform ||
			!Object.values(Platform).includes(
				platform.toUpperCase() as Platform
			)
		) {
			return NextResponse.json(
				{ error: "Invalid platform" },
				{ status: 400 }
			);
		}

		// Delete the platform integration
		await prisma.userPlatform.delete({
			where: {
				platform_userId: {
					platform: platform.toUpperCase() as Platform,
					userId: decodedToken.uid,
				},
			},
		});

		return NextResponse.json({
			message: "Platform disconnected successfully",
			platform,
		});
	} catch (error) {
		console.error("Error disconnecting platform:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
