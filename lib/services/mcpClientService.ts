import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
	MCPProductUpdate,
	MCPTrackProduct,
	MCPUntrackProduct,
	MCPUserTrackedProduct,
} from "@/types/mcp";
import logger from "../logger";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
if (!OPENAI_API_KEY) {
	throw new Error("OPENAI_API_KEY is not set");
}

if (!NEXTAUTH_URL) {
	throw new Error("NEXTAUTH_URL is not set");
}
export class MCPClientService {
	private mcp: Client;
	private llm: OpenAI;
	private transport: SSEClientTransport | null = null;
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
			this.transport = new SSEClientTransport(
				new URL(`${NEXTAUTH_URL}/sse`)
			);
			await this.mcp.connect(this.transport);
			const toolsResult = await this.mcp.listTools();

			logger.info("Available tools:", { tools: toolsResult.tools });

			this.tools = toolsResult.tools.map((tool) => ({
				type: "function",
				function: {
					name: tool.name,
					description: tool.description,
					parameters: tool.inputSchema,
				},
			}));

			this.isInitialized = true;
			logger.info("MCP Client initialized with tools:", {
				tools: this.tools,
			});
		} catch (error) {
			logger.error("Failed to initialize MCP Client:", error);
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
							"You are a helpful e-commerce shopping assistant. Only use available tools when necessary for specific tasks like product searches, price tracking, or getting product details. For general questions, provide direct answers without using tools. Ask follow-up questions if you need clarification. If you cannot answer a query, simply state that you cannot answer it. Your response should be formatted as markdown.",
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

			logger.info("LLM response:", { response });

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
		platforms?: (
			| "amazon"
			| "ebay"
			| "walmart"
			| "etsy"
			| "bestbuy"
			| "homedepot"
			| "zara"
		)[];
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
			logger.error("Error getting product details:", error);
			throw error;
		}
	}

	async trackProduct(params: MCPTrackProduct) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await this.mcp.callTool({
				name: "track_product",
				arguments: {
					userId: params.userId,
					productDetail: {
						...params.productDetail,
						tracking_type:
							params.productDetail.tracking_type || "price",
					},
				},
			});
			if (!Array.isArray(result.content) || !result.content[0]?.text) {
				throw new Error("Unexpected response format from MCP tool");
			}
			return JSON.parse(result.content[0].text);
		} catch (error) {
			logger.error("Error tracking product:", error);
			throw error;
		}
	}

	async untrackProduct(params: MCPUntrackProduct) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await this.mcp.callTool({
				name: "untrack_product",
				arguments: {
					userId: params.userId,
					productId: params.productId,
				},
			});
			if (!Array.isArray(result.content) || !result.content[0]?.text) {
				throw new Error("Unexpected response format from MCP tool");
			}
			return JSON.parse(result.content[0].text);
		} catch (error) {
			logger.error("Error untracking product:", error);
			throw error;
		}
	}

	async updateProductPrices(params: { updates: MCPProductUpdate[] }) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await this.mcp.callTool({
				name: "update_product_prices",
				arguments: {
					updates: params.updates.map((update) => ({
						productId: update.productId,
						currentPrice: Math.round(update.currentPrice),
					})),
				},
			});
			if (!Array.isArray(result.content) || !result.content[0]?.text) {
				throw new Error("Unexpected response format from MCP tool");
			}
			return JSON.parse(result.content[0].text);
		} catch (error) {
			logger.error("Error updating product prices:", error);
			throw error;
		}
	}

	async getUserTrackedProducts(params: MCPUserTrackedProduct) {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const result = await this.mcp.callTool({
				name: "get_user_tracked_products",
				arguments: {
					userId: params.userId,
					includePriceHistory: params.includePriceHistory || false,
				},
			});
			if (!Array.isArray(result.content) || !result.content[0]?.text) {
				throw new Error("Unexpected response format from MCP tool");
			}
			return JSON.parse(result.content[0].text);
		} catch (error) {
			logger.error("Error getting tracked products:", error);
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
