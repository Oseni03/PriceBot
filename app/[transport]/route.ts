import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import axios from "axios";
import { Scraper } from "@/lib/services/scraper";
import type { Platform } from "@/types/mcp";
import {
	getUserTrackedProducts,
	trackProduct,
	untrackProduct,
	updateAllProducts,
} from "@/services/products";

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
	throw new Error("Cannot run MCP server without BRIGHT_DATA_API_TOKEN env");
}

const api_headers = () => ({
	authorization: `Bearer ${api_token}`,
	"user-agent": `pricemorphe/1.0.0`,
});

// // Ensure required zones exist
// async function ensure_required_zones() {
// 	try {
// 		console.error("Checking for required zones...");
// 		const response = await axios({
// 			headers: api_headers(),
// 			method: "GET",
// 			url: "https://api.brightdata.com/zone/get_active_zones",
// 		});
// 		const zones = response.data || [];
// 		const has_unlocker_zone = zones.some(
// 			(zone: { name: string }) => zone.name == unlocker_zone
// 		);
// 		if (!has_unlocker_zone) {
// 			console.error(
// 				`Required zone "${unlocker_zone}" not found, creating it...`
// 			);
// 			await axios({
// 				data: {
// 					plan: { type: "unblocker" },
// 					zone: { name: unlocker_zone, type: "unblocker" },
// 				},
// 				headers: {
// 					...api_headers(),
// 					"Content-Type": "application/json",
// 				},
// 				method: "POST",
// 				url: "https://api.brightdata.com/zone",
// 			});
// 			console.error(`Zone "${unlocker_zone}" created successfully`);
// 		} else {
// 			console.error(`Required zone "${unlocker_zone}" already exists`);
// 		}
// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	} catch (e: any) {
// 		console.error(
// 			"Error checking/creating zones:",
// 			e.response?.data || e.message
// 		);
// 	}
// }

// (async () => {
// 	await ensure_required_zones();
// })();

const handler = createMcpHandler(
	(server) => {
		// Product search tool
		server.tool(
			"search_products",
			"Search for products across multiple e-commerce platforms",
			{
				max_results: z.number().min(1).max(50).optional().default(10),
				platforms: z
					.array(
						z.enum([
							"amazon",
							"ebay",
							"walmart",
							"etsy",
							"bestbuy",
							"homedepot",
							"zara",
						])
					)
					.optional()
					.default(["amazon", "ebay", "walmart"]),
				query: z.string(),
			},
			async ({ platforms, query, max_results }) => {
				try {
					const results = [];

					for (const platform of platforms) {
						try {
							let search_url = "";
							switch (platform) {
								case "amazon":
									search_url = `https://www.amazon.com/s?k=${encodeURIComponent(
										query
									)}`;
									break;
								case "bestbuy":
									search_url = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(
										query
									)}&intl=nosplash`;
									break;
								case "ebay":
									search_url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
										query
									)}`;
									break;
								case "etsy":
									search_url = `https://www.etsy.com/search?q=${encodeURIComponent(
										query
									)}`;
									break;
								case "homedepot":
									search_url = `https://www.homedepot.com/search?q=${encodeURIComponent(
										query
									)}`;
									break;
								case "walmart":
									search_url = `https://www.walmart.com/search?q=${encodeURIComponent(
										query
									)}`;
									break;
								case "zara":
									search_url = `https://www.zara.com/us/en/search?q=${encodeURIComponent(
										query
									)}`;
									break;
							}

							const response = await axios({
								data: {
									format: "raw",
									url: search_url,
									zone: unlocker_zone,
								},
								headers: api_headers(),
								method: "POST",
								responseType: "text",
								url: "https://api.brightdata.com/request",
							});

							const baseUrl = new URL(search_url).origin;
							const parsedProducts =
								scraperService.parseSearchResults(
									response.data,
									platform,
									baseUrl
								);

							results.push({
								data: parsedProducts,
								platform,
								search_url,
							});
						} catch (error) {
							results.push({
								error:
									error instanceof Error
										? error.message
										: "Unknown error",
								platform,
							});
						}
					}

					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(
									{ query, results },
									null,
									2
								),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error searching products: ${
									error instanceof Error
										? error.message
										: "Unknown error"
								}`,
							},
						],
					};
				}
			}
		);

		// Product details tool
		server.tool(
			"get_product_details",
			"Get detailed information about a specific product from its URL",
			{
				url: z.string().url(),
			},
			async ({ url }) => {
				try {
					const platform = detect_platform(url);
					const response = await axios({
						data: {
							format: "raw",
							url,
							zone: unlocker_zone,
						},
						headers: api_headers(),
						method: "POST",
						responseType: "text",
						url: "https://api.brightdata.com/request",
					});
					const baseUrl = new URL(url).origin;
					const parsedProduct = scraperService.parseProductDetails(
						response.data,
						platform,
						baseUrl
					);

					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(parsedProduct, null, 2),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error fetching product details: ${
									error instanceof Error
										? error.message
										: "Unknown error"
								}`,
							},
						],
					};
				}
			}
		);

		// Price update tool
		server.tool(
			"get_price_update",
			"Get product information for multiple product URLs",
			{
				urls: z.array(z.string().url()).optional().default([]),
			},
			async ({ urls }) => {
				try {
					const updates = await Promise.all(
						urls.map(async (url) => {
							try {
								const platform = detect_platform(url);
								const response = await axios({
									data: {
										format: "raw",
										url,
										zone: unlocker_zone,
									},
									headers: api_headers(),
									method: "POST",
									responseType: "text",
									url: "https://api.brightdata.com/request",
								});
								const baseUrl = new URL(url).origin;
								const parsedProduct =
									scraperService.parseProductDetails(
										response.data,
										platform,
										baseUrl
									);

								return {
									status: "success",
									url,
									data: parsedProduct,
								};
							} catch (error) {
								return {
									status: "error",
									url,
									error:
										error instanceof Error
											? error.message
											: "Unknown error",
								};
							}
						})
					);

					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(
									{
										timestamp: new Date().toISOString(),
										total: urls.length,
										updates,
									},
									null,
									2
								),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error updating prices: ${
									error instanceof Error
										? error.message
										: "Unknown error"
								}`,
							},
						],
					};
				}
			}
		);

		// Track product tool
		server.tool(
			"track_product",
			"Track a new product for a user",
			{
				productDetail: z.object({
					name: z.string(),
					platform: z.enum([
						"amazon",
						"ebay",
						"walmart",
						"etsy",
						"bestbuy",
						"homedepot",
						"zara",
						"unknown",
					]),
					target_price: z.number().optional(),
					tracking_type: z
						.enum(["price", "stock", "both"])
						.default("price"),
					url: z.string().url(),
				}),
				userId: z.string(),
			},
			async ({ userId, productDetail }) => {
				try {
					const result = await trackProduct(
						userId,
						productDetail.url
					);
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error tracking product: ${
									error instanceof Error
										? error.message
										: "Unknown error"
								}`,
							},
						],
					};
				}
			}
		);

		// Untrack product tool
		server.tool(
			"untrack_product",
			"Stop tracking a product for a user",
			{
				productId: z.string(),
				userId: z.string(),
			},
			async ({ userId, productId }) => {
				try {
					const result = await untrackProduct(userId, productId);
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error untracking product: ${
									error instanceof Error
										? error.message
										: "Unknown error"
								}`,
							},
						],
					};
				}
			}
		);

		// Update product prices tool
		server.tool(
			"update_product_prices",
			"Update prices for multiple tracked products",
			{
				updates: z.array(
					z.object({
						currentPrice: z.number(),
						productId: z.string(),
					})
				),
			},
			async ({ updates }) => {
				try {
					const result = await updateAllProducts(updates);
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error updating product prices: ${
									error instanceof Error
										? error.message
										: "Unknown error"
								}`,
							},
						],
					};
				}
			}
		);

		// Get user tracked products tool
		server.tool(
			"get_user_tracked_products",
			"Get all products tracked by a specific user",
			{
				includePriceHistory: z.boolean().optional().default(false),
				userId: z.string(),
			},
			async ({ userId, includePriceHistory }) => {
				try {
					const result = await getUserTrackedProducts({
						userId,
						include_price_history: includePriceHistory,
					});
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error getting tracked products: ${
									error instanceof Error
										? error.message
										: "Unknown error"
								}`,
							},
						],
					};
				}
			}
		);
	},
	{ capabilities: { tools: {} } },
	{
		redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
		sseEndpoint: "/sse",
		streamableHttpEndpoint: "/mcp",
		verboseLogs: true,
		maxDuration: 60 * 60, // 1 hour
	}
);

export { handler as GET, handler as POST, handler as DELETE };
