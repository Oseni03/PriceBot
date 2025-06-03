import logger from "@/lib/logger";
import { mcpClientService } from "@/lib/services/mcpClientService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { query, platforms, max_results } = body;

		if (!query) {
			return NextResponse.json(
				{ error: "Query is required" },
				{ status: 400 }
			);
		}

		const results = await mcpClientService.searchProducts({
			query,
			platforms,
			max_results,
		});

		return NextResponse.json(results);
	} catch (error) {
		logger.error("Search products error:", error);
		return NextResponse.json(
			{ error: "Failed to search products" },
			{ status: 500 }
		);
	}
}
