import { NextRequest } from "next/server";
import {
	getUserTrackedProducts,
	trackProduct,
	untrackProduct,
} from "@/services/products";
import logger from "@/lib/logger";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return new Response("userId is required", { status: 400 });
		}

		const products = await getUserTrackedProducts({
			userId,
			include_price_history: true,
		});

		return new Response(JSON.stringify(products), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		logger.error("Error fetching user products:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { url, userId } = await request.json();

		if (!url || !userId) {
			return new Response("url and userId are required", { status: 400 });
		}

		// Detect platform from URL
		let platform = "unknown";
		if (url.includes("amazon.")) platform = "amazon";
		else if (url.includes("ebay.")) platform = "ebay";
		else if (url.includes("walmart.")) platform = "walmart";
		else if (url.includes("etsy.")) platform = "etsy";
		else if (url.includes("bestbuy.")) platform = "bestbuy";
		else if (url.includes("homedepot.")) platform = "homedepot";
		else if (url.includes("zara.")) platform = "zara";

		const productDetail = {
			name: "Product", // Will be updated when details are fetched
			platform: platform as any,
			url,
			tracking_type: "price_change" as const,
		};

		const result = await trackProduct(userId, productDetail);

		return new Response(JSON.stringify(result), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		logger.error("Error tracking product:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const productId = searchParams.get("productId");
		const userId = searchParams.get("userId");

		if (!productId || !userId) {
			return new Response("productId and userId are required", {
				status: 400,
			});
		}

		const result = await untrackProduct(userId, productId);

		return new Response(JSON.stringify(result), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		logger.error("Error untracking product:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
