import logger from "@/lib/logger";
import { mcpClientService } from "@/lib/services/mcpClientService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { userId, productDetail } = body;

		if (!userId || !productDetail) {
			return NextResponse.json(
				{ error: "User ID and product details are required" },
				{ status: 400 }
			);
		}

		const result = await mcpClientService.trackProduct({
			userId,
			productDetail,
		});
		return NextResponse.json(result);
	} catch (error) {
		logger.error("Track product error:", error);
		return NextResponse.json(
			{ error: "Failed to track product" },
			{ status: 500 }
		);
	}
}
