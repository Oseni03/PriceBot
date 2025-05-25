// app/api/cron/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { callMCPServer } from "@/lib/telegramBot";
import logger from "@/lib/logger";

export async function POST() {
	try {
		// Get authorization header
		const headersList = await headers();
		const authHeader = headersList.get("authorization");

		// Verify cron secret
		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Execute price updates
		const results = await callMCPServer("update_tracked_prices", {});

		return NextResponse.json(
			{ success: true, results },
			{
				status: 200,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		logger.error("Cron job failed:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{
				status: 500,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json",
				},
			}
		);
	}
}

export function OPTIONS() {
	return NextResponse.json(
		{},
		{
			status: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		}
	);
}
