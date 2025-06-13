import logger from "@/lib/logger";
import { checkSubscriptionAccess } from "@/lib/middleware/checkSubscription";
import { prisma } from "@/lib/prisma";
import { mcpClientService } from "@/lib/services/mcpClientService";
import { getUserProducts } from "@/services/products";
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

		// Check subscription access
		const result = await checkSubscriptionAccess(req, "PRO");
		if ("error" in result) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.status }
			);
		}

		// Check product tracking limit
		const trackedProducts = await getUserProducts(result.userId);

		if (trackedProducts >= result.subscription?.productLimit || 0) {
			return NextResponse.json(
				{
					error: "Product tracking limit reached. Please upgrade your plan to track more products.",
				},
				{ status: 403 }
			);
		}

		const details = await mcpClientService.getProductDetails({ url });
		return NextResponse.json(details);
	} catch (error) {
		logger.error("Get product details error:", error);
		return NextResponse.json(
			{ error: "Failed to get product details" },
			{ status: 500 }
		);
	}
}
