import { streamText } from "ai";
import { z } from "zod";
import { NextRequest } from "next/server";
import { getMessages, createMessage } from "@/services/messages";
import { CreditService } from "@/services/credits";
import logger from "@/lib/logger";
import { openai } from "@ai-sdk/openai";
import axios from "axios";
import { DealProduct, Scraper } from "@/lib/services/scraper";
import type { Platform } from "@/types/mcp";
import {
	getUserTrackedProducts,
	trackProduct,
	untrackProduct,
} from "@/services/products";
import { createDataStream, generateId } from "ai";
import { convertDBMessageToAI } from "@/lib/message-utils";

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

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
	try {
		const { query, userId, messages } = await req.json();

		if (!query || !userId) {
			return new Response("Missing required fields: query and userId", {
				status: 400,
			});
		}

		// Get previous messages for context
		let previousMessages;
		if (!messages) {
			const dbMessages = await getMessages(userId);
			previousMessages = dbMessages.slice(-6).map(convertDBMessageToAI);
		} else {
			previousMessages = messages;
		}

		// Use credits before processing
		await CreditService.useCredits(userId, "AI_CHAT");

		const stream = createDataStream({
			execute: (dataStream) => {
				const result = streamText({
					model: openai("gpt-4"),
					messages: previousMessages,
					tools: {
						// Product search tool
						search_products: {
							description:
								"Search for products across multiple e-commerce platforms",
							parameters: z.object({
								max_results: z
									.number()
									.min(1)
									.max(50)
									.optional()
									.default(10),
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
							}),
							execute: async ({
								platforms,
								query,
								max_results,
							}) => {
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

											const baseUrl = new URL(search_url)
												.origin;
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
									return { query, results };
								} catch (error) {
									throw new Error(
										`Error searching products: ${
											error instanceof Error
												? error.message
												: "Unknown error"
										}`
									);
								}
							},
						},

						// Product details tool
						get_product_details: {
							description:
								"Get detailed information about a specific product from its URL",
							parameters: z.object({
								url: z.string().url(),
							}),
							execute: async ({ url }) => {
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
									return scraperService.parseProductDetails(
										response.data,
										platform,
										baseUrl
									);
								} catch (error) {
									throw new Error(
										`Error fetching product details: ${
											error instanceof Error
												? error.message
												: "Unknown error"
										}`
									);
								}
							},
						},

						// Track product tool
						track_product: {
							description: "Track a new product for a user",
							parameters: z.object({
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
										.enum(["target_price", "price_change"])
										.default("price_change"),
									url: z.string().url(),
								}),
								userId: z.string(),
							}),
							execute: async ({ userId, productDetail }) => {
								try {
									return await trackProduct(
										userId,
										productDetail
									);
								} catch (error) {
									throw new Error(
										`Error tracking product: ${
											error instanceof Error
												? error.message
												: "Unknown error"
										}`
									);
								}
							},
						},

						// Untrack product tool
						untrack_product: {
							description: "Stop tracking a product for a user",
							parameters: z.object({
								productId: z.string(),
								userId: z.string(),
							}),
							execute: async ({ userId, productId }) => {
								try {
									return await untrackProduct(
										userId,
										productId
									);
								} catch (error) {
									throw new Error(
										`Error untracking product: ${
											error instanceof Error
												? error.message
												: "Unknown error"
										}`
									);
								}
							},
						},

						// Get user tracked products tool
						get_user_tracked_products: {
							description:
								"Get all products tracked by a specific user",
							parameters: z.object({
								includePriceHistory: z
									.boolean()
									.optional()
									.default(false),
								userId: z.string(),
							}),
							execute: async ({
								userId,
								includePriceHistory,
							}) => {
								try {
									return await getUserTrackedProducts({
										userId,
										include_price_history:
											includePriceHistory,
									});
								} catch (error) {
									throw new Error(
										`Error getting tracked products: ${
											error instanceof Error
												? error.message
												: "Unknown error"
										}`
									);
								}
							},
						},

						// Get top deals tool
						get_top_deals: {
							description:
								"Get top deals and discounts across all supported platforms",
							parameters: z.object({
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
								maxResults: z
									.number()
									.min(1)
									.max(50)
									.optional()
									.default(10),
								minDiscountPercent: z
									.number()
									.min(0)
									.max(100)
									.optional()
									.default(10),
							}),
							execute: async ({
								platforms,
								maxResults,
								minDiscountPercent,
							}) => {
								try {
									const deals = [];
									for (const platform of platforms) {
										try {
											let deals_url = "";
											switch (platform) {
												case "amazon":
													deals_url =
														"https://www.amazon.com/deals";
													break;
												case "bestbuy":
													deals_url =
														"https://www.bestbuy.com/site/deals";
													break;
												case "ebay":
													deals_url =
														"https://www.ebay.com/deals";
													break;
												case "etsy":
													deals_url =
														"https://www.etsy.com/sales-and-deals";
													break;
												case "homedepot":
													deals_url =
														"https://www.homedepot.com/deals";
													break;
												case "walmart":
													deals_url =
														"https://www.walmart.com/deals";
													break;
												case "zara":
													deals_url =
														"https://www.zara.com/us/en/sale";
													break;
											}

											const response = await axios({
												data: {
													format: "raw",
													url: deals_url,
													zone: unlocker_zone,
												},
												headers: api_headers(),
												method: "POST",
												responseType: "text",
												url: "https://api.brightdata.com/request",
											});

											const baseUrl = new URL(deals_url)
												.origin;
											const parsedDeals =
												scraperService.parseDeals(
													response.data,
													platform,
													baseUrl
												);
											const filteredDeals = parsedDeals
												.filter(
													(deal: DealProduct) =>
														deal.discountPercentage >=
														minDiscountPercent
												)
												.slice(0, maxResults);

											deals.push({
												platform,
												deals_url,
												data: filteredDeals,
											});
										} catch (error) {
											deals.push({
												platform,
												error:
													error instanceof Error
														? error.message
														: "Unknown error",
											});
										}
									}
									return {
										timestamp: new Date().toISOString(),
										deals: deals as unknown as DealProduct[],
									};
								} catch (error) {
									throw new Error(
										`Error getting top deals: ${
											error instanceof Error
												? error.message
												: "Unknown error"
										}`
									);
								}
							},
						},
					},
					onFinish: async ({ response }) => {
						// Save the bot response to the database
						const lastMessage =
							response.messages[response.messages.length - 1];
						const content =
							typeof lastMessage.content === "string"
								? lastMessage.content
								: JSON.stringify(lastMessage.content);

						await createMessage(content, "BOT", userId);
					},
				});

				result.mergeIntoDataStream(dataStream);
			},
		});

		return new Response(stream);
	} catch (error) {
		logger.error("Error in chat route:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
