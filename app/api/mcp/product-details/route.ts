import { mcpClientService } from "@/lib/services/mcpClientService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { url } = await req.json();

		if (!url) {
			return NextResponse.json(
				{ error: "URL is required" },
				{ status: 400 }
			);
		}

		const details = await mcpClientService.getProductDetails({ url });
		return NextResponse.json(details);
	} catch (error) {
		console.error("Get product details error:", error);
		return NextResponse.json(
			{ error: "Failed to get product details" },
			{ status: 500 }
		);
	}
}
