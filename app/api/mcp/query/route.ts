import { NextResponse } from "next/server";
import { mcpClientService } from "@/lib/services/mcpClientService";
import logger from "@/lib/logger";
import { CreditService } from "@/services/credits";

export async function POST(req: Request) {
	try {
		const { query, userId, previousMessages } = await req.json();

		if (!query) {
			return NextResponse.json(
				{ error: "Query is required" },
				{ status: 400 }
			);
		}

		await CreditService.useCredits(userId, "AI_CHAT");

		const response = await mcpClientService.processQuery(
			query,
			userId,
			previousMessages
		);

		return NextResponse.json(
			{ response },
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		logger.error("MCP Client processing error:", error);
		return NextResponse.json(
			{ error: "Failed to process query" },
			{ status: 500 }
		);
	}
}
