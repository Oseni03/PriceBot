import { NextRequest } from "next/server";
import axios from "axios";
import { DealProduct, Scraper } from "@/lib/services/scraper";
import type { Platform } from "@/types/mcp";
import logger from "@/lib/logger";

// Helper function to detect platform
function detect_platform(url: string): Platform {
	if (url.includes("amazon.")) return "amazon";
	if (url.includes("ebay.")) return "ebay";
	if (url.includes("walmart.")) return "walmart";
	if (url.includes("etsy.")) return "etsy";
	if (url.includes("bestbuy.")) return "bestbuy";
	if (url.includes("homedepot.")) return "homedepot";
	if (url.includes("zara.")) return "zara";
	return "unknown";
}

// Initialize scraper service
const scraperService = new Scraper();

const api_token = process.env.BRIGHT_DATA_API_TOKEN;
const unlocker_zone = process.env.WEB_UNLOCKER_ZONE || "ecommerce_tracker";

if (!api_token) {
	throw new Error("Cannot run without BRIGHT_DATA_API_TOKEN env");
}

const api_headers = () => ({
	authorization: `Bearer ${api_token}`,
	"user-agent": `morpheai/1.0.0`,
});

export async function POST(request: NextRequest) {
	try {
		const { url } = await request.json();

		if (!url) {
			return new Response("url is required", { status: 400 });
		}

		const platform = detect_platform(url);
		const response = await axios({
			data: { format: "raw", url, zone: unlocker_zone },
			headers: api_headers(),
			method: "POST",
			responseType: "text",
			url: "https://api.brightdata.com/request",
		});

		const baseUrl = new URL(url).origin;
		const productDetails = scraperService.parseProductDetails(
			response.data,
			platform,
			baseUrl
		);

		return new Response(JSON.stringify(productDetails), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		logger.error("Error fetching product details:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
