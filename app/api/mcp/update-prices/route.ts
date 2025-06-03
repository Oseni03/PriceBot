import logger from "@/lib/logger";
import { mcpClientService } from "@/lib/services/mcpClientService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { updates } = await req.json();

		if (!updates || !Array.isArray(updates)) {
			return NextResponse.json(
				{ error: "Valid updates array is required" },
				{ status: 400 }
			);
		}

		const result = await mcpClientService.updateProductPrices({ updates });
		return NextResponse.json(result);
	} catch (error) {
		logger.error("Update prices error:", error);
		return NextResponse.json(
			{ error: "Failed to update prices" },
			{ status: 500 }
		);
	}
}
