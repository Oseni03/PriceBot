import logger from "@/lib/logger";
import { mcpClientService } from "@/lib/services/mcpClientService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { userId, includePriceHistory } = await req.json();

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		const products = await mcpClientService.getUserTrackedProducts({
			userId,
			includePriceHistory,
		});
		return NextResponse.json(products);
	} catch (error) {
		logger.error("Get user products error:", error);
		return NextResponse.json(
			{ error: "Failed to get user products" },
			{ status: 500 }
		);
	}
}
