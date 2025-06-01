import TelegramBot from "node-telegram-bot-api";
import { type Product } from "@/types/products";
interface SearchResult {
	platform: string;
	error?: string;
	search_url?: string;
}

interface SearchResults {
	results: SearchResult[];
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

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
		const emoji = product.target_price ? "🎯" : "📈";
		message += `${emoji} *${product.name}*\n`;
		message += `🏪 Platform: ${product.platform}\n`;
		message += `📅 Tracked since: ${new Date(
			product.createdAt || new Date()
		).toLocaleDateString()}\n`;

		if (product.prices && product.prices.length > 0) {
			const latestPrice = product.prices[0].amount;
			message += `💰 Current Price: $${(latestPrice / 100).toFixed(2)}\n`;
		}

		if (product.target_price) {
			message += `🎯 Target: $${(product.target_price / 100).toFixed(
				2
			)}\n`;
		}

		message += `🔄 Price Updates: ${product.prices?.length || 0}\n`;
		message += `🔗 [View Product](${product.url})\n\n`;
	});

	return message;
}
