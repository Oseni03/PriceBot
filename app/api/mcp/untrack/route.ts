import { mcpClientService } from "@/lib/services/mcpClientService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { userId, productId } = await req.json();

		if (!userId || !productId) {
			return NextResponse.json(
				{ error: "User ID and Product ID are required" },
				{ status: 400 }
			);
		}

		const result = await mcpClientService.untrackProduct({
			userId,
			productId,
		});
		return NextResponse.json(result);
	} catch (error) {
		console.error("Untrack product error:", error);
		return NextResponse.json(
			{ error: "Failed to untrack product" },
			{ status: 500 }
		);
	}
}
