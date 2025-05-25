// app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { handleUpdate } from "@/lib/botHandler";
import logger from "@/lib/logger";

export async function POST(req: Request) {
	try {
		const update = await req.json();

		// Process Telegram update
		await handleUpdate(update);

		return NextResponse.json(
			{ status: "processed" },
			{
				status: 200,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		logger.error("Webhook processing error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
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
				"Access-Control-Allow-Headers": "Content-Type",
			},
		}
	);
}
