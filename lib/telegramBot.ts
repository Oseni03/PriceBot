import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

// Add type definitions
interface SearchResult {
	platform: string;
	error?: string;
	search_url?: string;
}

interface Product {
	name: string;
	platform: string;
	first_tracked: string;
	update_count: number;
	price_history_count: number;
	target_price?: number;
	url: string;
	tracking_type: "target_price" | "price_change";
}

interface SearchResults {
	results: SearchResult[];
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3001";

if (!TELEGRAM_BOT_TOKEN) {
	throw new Error("TELEGRAM_BOT_TOKEN is required");
}

// Initialize Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// Initialize in webhook mode for Next.js
export async function setupWebhook() {
	await bot.setWebHook(`${process.env.NEXTAUTH_URL}/api/webhook`);
}

// Shared bot instance
export const telegramBot = bot;

// Store sessions in-memory (consider Redis for production)
export const userSessions = new Map<string, any>();
export const userTrackedProducts = new Map<string, Map<string, Product>>();

// MCP Server helper
export async function callMCPServer(
	tool: string,
	params: Record<string, any> = {}
) {
	try {
		const response = await axios.post(
			`${MCP_SERVER_URL}/tools/${tool}`,
			params
		);
		return response.data;
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error(`MCP Server error for ${tool}:`, errorMessage);
		throw new Error(`Failed to execute ${tool}: ${errorMessage}`);
	}
}

// Formatting helpers
export function formatSearchResults(results: SearchResults, query: string) {
	let message = `🛒 *Search Results for "${query}"*\n\n`;

	if (results.results && results.results.length > 0) {
		results.results.forEach((result: SearchResult) => {
			message += `🏪 *${result.platform.toUpperCase()}*\n`;
			if (result.error) {
				message += `❌ Error: ${result.error}\n`;
			} else {
				message += `✅ Results found\n`;
				if (result.search_url) {
					message += `🔗 [View Results](${result.search_url})\n`;
				}
			}
			message += "\n";
		});

		message +=
			"💡 *Tip:* Send me a specific product URL to track it for price changes!";
	} else {
		message = `❌ No results found for "${query}". Please try a different search term.`;
	}
	return message;
}

export function getUserTrackedProducts(userId: string) {
	if (!userTrackedProducts.has(userId)) {
		userTrackedProducts.set(userId, new Map());
	}
	return userTrackedProducts.get(userId);
}

// Helper function to format price comparison results
export function formatPriceComparison(results: SearchResult[]) {
	let message = "🛒 *Price Comparison Results*\n\n";

	results.forEach((result: SearchResult) => {
		if (result.error) {
			message += `❌ ${result.platform}: Error - ${result.error}\n`;
		} else {
			message += `🏪 *${result.platform.toUpperCase()}*\n`;
			message += `📊 Data available\n`;
			if (result.search_url) {
				message += `🔗 [View Results](${result.search_url})\n`;
			}
			message += "\n";
		}
	});

	return message;
}

// Helper function to format tracked products
export function formatTrackedProducts(products: Product[]) {
	if (products.length === 0) {
		return "📭 You have no tracked products yet.\n\nUse /track to start tracking a product!";
	}

	let message = `📊 *Your Tracked Products (${products.length})*\n\n`;

	products.forEach((product: Product) => {
		const emoji = product.tracking_type === "target_price" ? "🎯" : "📈";
		message += `${emoji} *${product.name}*\n`;
		message += `🏪 Platform: ${product.platform}\n`;
		message += `📅 Tracked since: ${new Date(
			product.first_tracked
		).toLocaleDateString()}\n`;
		message += `🔄 Updates: ${product.update_count}\n`;
		message += `📊 Price history: ${product.price_history_count} entries\n`;

		if (product.target_price) {
			message += `💰 Target: $${product.target_price}\n`;
		}

		message += `🔗 [View Product](${product.url})\n\n`;
	});

	return message;
}
