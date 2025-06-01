import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import {
	MCPProductUpdate,
	MCPTrackProduct,
	MCPUntrackProduct,
	MCPUserTrackedProduct,
} from "@/types/mcp";
import { z } from "zod";
import {
	getUserTrackedProducts,
	trackProduct,
	untrackProduct,
	updateAllProducts,
} from "@/services/products";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
	throw new Error("OPENAI_API_KEY is not set");
}

export class MCPClientService {
	private mcp: Client;
	private llm: OpenAI;
	private transport: StdioClientTransport | null = null;
	public tools: any[] = [];
	private static instance: MCPClientService;
	private isInitialized = false;

	private constructor() {
		this.llm = new OpenAI({
			apiKey: OPENAI_API_KEY,
		});
		this.mcp = new Client({
			name: "pricebot-mcp-client",
			version: "1.0.0",
		});
	}

	public static getInstance(): MCPClientService {
		if (!MCPClientService.instance) {
			MCPClientService.instance = new MCPClientService();
		}
		return MCPClientService.instance;
	}

	async initialize() {
		if (this.isInitialized) {
			return;
		}

		try {
			// Path to your MCP server script
			const serverScriptPath = path.join(
				process.cwd(),
				"server",
				"mcp-server.js"
			);

			this.transport = new StdioClientTransport({
				command: process.execPath, // Node.js executable
				args: [serverScriptPath],
			});

			await this.mcp.connect(this.transport);
			const toolsResult = await this.mcp.listTools();

			this.tools = [
				...toolsResult.tools.map((tool) => ({
					type: "function",
					function: {
						name: tool.name,
						description: tool.description,
						parameters: tool.inputSchema,
					},
				})),
				{
					type: "function",
					function: {
						name: "track_product",
						description:
							"Track a new product for a user. All prices are stored in cents/pennies to avoid floating point issues.",
						parameters: z.object({
							productDetail: z.object({
								name: z.string().describe("Product name"),
								platform: z
									.enum([
										"amazon",
										"ebay",
										"walmart",
										"etsy",
										"bestbuy",
										"homedepot",
										"zara",
										"unknown",
									])
									.describe(
										"The e-commerce platform where the product is listed"
									),
								target_price: z
									.number()
									.optional()
									.describe(
										"Target price for price alerts (in dollars)"
									),
								tracking_type: z
									.enum(["price", "stock", "both"])
									.default("price")
									.describe(
										"What to track: price changes, stock status, or both"
									),
								url: z
									.string()
									.url()
									.describe("Product URL to track"),
							}),
							userId: z
								.string()
								.describe(
									"User ID to associate the tracked product with"
								),
						}),
					},
				},
				{
					type: "function",
					function: {
						name: "get_user_tracked_products",
						description:
							"Get all products tracked by a specific user",
						parameters: z.object({
							include_price_history: z
								.boolean()
								.optional()
								.default(false),
							userId: z.string(),
						}),
					},
				},
				{
					type: "function",
					function: {
						name: "untrack_product",
						description: "Stop tracking a product for a user",
						parameters: z.object({
							productId: z.string(),
							userId: z.string(),
						}),
					},
				},
				{
					type: "function",
					function: {
						name: "update_product_prices",
						description:
							"Update prices for multiple tracked products",
						parameters: z.object({
							updates: z.array(
								z.object({
									currentPrice: z.number(),
									productId: z.string(),
								})
							),
						}),
					},
				},
			];

			this.isInitialized = true;
			console.log(
				"MCP Client initialized with tools:",
				this.tools.map((t) => t.function.name)
			);
		} catch (error) {
			console.error("Failed to initialize MCP Client:", error);
			throw error;
		}
	}

	async processQuery(
		query: string,
		userId?: string,
		chatId?: string
	): Promise<string> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
				[
					{
						role: "system",
						content:
							"You are a helpful assistant that can search for products, track prices, and provide product information across multiple e-commerce platforms.",
					},
					{
						role: "user",
						content: `${query}${
							userId ? `\n\nUser ID: ${userId}` : ""
						}${chatId ? `\nChat ID: ${chatId}` : ""}`,
					},
				];

			const response = await this.llm.chat.completions.create({
				model: "gpt-4-turbo-preview",
				messages,
				tools: this.tools,
				tool_choice: "auto",
			});

			let finalResponse = "";
			const assistantMessage = response.choices[0]?.message;

			if (assistantMessage?.content) {
				finalResponse += assistantMessage.content;
			}

			if (assistantMessage?.tool_calls) {
				for (const toolCall of assistantMessage.tool_calls) {
					const toolName = toolCall.function.name;
					const toolArgs = JSON.parse(toolCall.function.arguments);

					console.log(
						`Calling tool: ${toolName} with args:`,
						toolArgs
					);

					const result = await this.mcp.callTool({
						name: toolName,
						arguments: toolArgs,
					});

					// Process the tool result with another LLM call
					const followUpMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
						[
							...messages,
							assistantMessage,
							{
								role: "tool",
								tool_call_id: toolCall.id,
								content: JSON.stringify(result.content),
							},
						];

					const followUpResponse =
						await this.llm.chat.completions.create({
							model: "gpt-4-turbo-preview",
							messages: followUpMessages,
						});

					if (followUpResponse.choices[0]?.message?.content) {
						finalResponse =
							followUpResponse.choices[0].message.content;
					}
				}
			}

			return finalResponse;
		} catch (error) {
			console.error("Error processing MCP query:", error);
			throw error;
		}
	}

	// Direct tool calling methods for more granular control
	async searchProducts(params: {
		query: string;
		platforms?: string[];
		max_results?: number;
	}) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await this.mcp.callTool({
				name: "search_products",
				arguments: params,
			});
			return result.content;
		} catch (error) {
			console.error("Error searching products:", error);
			throw error;
		}
	}

	async getProductDetails(params: { url: string }) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await this.mcp.callTool({
				name: "get_product_details",
				arguments: params,
			});
			return result.content;
		} catch (error) {
			console.error("Error getting product details:", error);
			throw error;
		}
	}

	async trackProduct(params: MCPTrackProduct) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await trackProduct(
				params.userId,
				params.productDetail.url
			);
			return result;
		} catch (error) {
			console.error("Error tracking product:", error);
			throw error;
		}
	}

	async untrackProduct(params: MCPUntrackProduct) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await untrackProduct(
				params.userId,
				params.productId
			);
			return result;
		} catch (error) {
			console.error("Error untracking product:", error);
			throw error;
		}
	}

	async updateProductPrices(params: { updates: MCPProductUpdate[] }) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await updateAllProducts(params.updates);
			return result;
		} catch (error) {
			console.error("Error updating product prices:", error);
			throw error;
		}
	}

	async getUserTrackedProducts(params: MCPUserTrackedProduct) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await getUserTrackedProducts({
				userId: params.userId,
				include_price_history: params.includePriceHistory || false,
			});
			return result;
		} catch (error) {
			console.error("Error getting tracked products:", error);
			throw error;
		}
	}

	async cleanup() {
		if (this.transport) {
			await this.mcp.close();
			this.transport = null;
			this.isInitialized = false;
		}
	}
}

export const mcpClientService = MCPClientService.getInstance();
