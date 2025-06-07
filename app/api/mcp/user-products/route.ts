import { NextResponse } from "next/server";
import { mcpClientService } from "@/lib/services/mcpClientService";
import logger from "@/lib/logger";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const userId = url.searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Get user's tracked products using MCP service
		const products = await mcpClientService.getUserTrackedProducts({
			userId: userId,
			includePriceHistory: true,
		});

		return NextResponse.json(products);
	} catch (error) {
		logger.error("Error fetching products:", error);
		return NextResponse.json(
			{ error: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	try {
		const data = await req.json();
		// Handle tracking a product
		const { url, targetPrice, userId } = data;

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		if (!url) {
			return NextResponse.json(
				{ error: "URL is required" },
				{ status: 400 }
			);
		}

		// Get initial product details from MCP
		const detailsUnknown = await mcpClientService.getProductDetails({
			url,
		});

		// Type guard or assertion for details
		if (
			!detailsUnknown ||
			typeof detailsUnknown !== "object" ||
			!("name" in detailsUnknown) ||
			!("platform" in detailsUnknown)
		) {
			return NextResponse.json(
				{ error: "Failed to fetch product details" },
				{ status: 400 }
			);
		}
		const details = detailsUnknown as { name: string; platform: string };

		// Track the product with MCP
		const result = await mcpClientService.trackProduct({
			userId,
			productDetail: {
				url,
				name: details.name,
				platform: details.platform,
				target_price: targetPrice,
				tracking_type: "price_change",
			},
		});

		return NextResponse.json(result);
	} catch (error) {
		logger.error("Error tracking product:", error);
		return NextResponse.json(
			{ error: "Failed to track product" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: Request) {
	try {
		const url = new URL(req.url);
		const productId = url.searchParams.get("productId");
		const userId = url.searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "Invalid or expired authentication token" },
				{ status: 401 }
			);
		}

		if (!productId) {
			return NextResponse.json(
				{ error: "Product ID is required" },
				{ status: 400 }
			);
		}

		// Untrack the product with MCP
		await mcpClientService.untrackProduct({
			userId,
			productId,
		});

		return NextResponse.json({ message: "Product untracked successfully" });
	} catch (error) {
		logger.error("Error untracking product:", error);
		return NextResponse.json(
			{ error: "Failed to untrack product" },
			{ status: 500 }
		);
	}
}
