import {
	getAllTrackedProducts,
	getUserTrackedProducts,
	trackProduct,
	untrackProduct,
	updateAllProducts,
} from "@/services/products";
import logger from "./logger";
import {
	telegramBot as bot,
	callMCPServer,
	formatSearchResults,
	formatPriceComparison,
	formatTrackedProducts,
} from "./telegramBot";
import { Product } from "./generated/prisma";
import { createOrUpdateUser } from "@/services/user";
import { sessionService } from "./services/sessionService";
import { mcpClientService } from "./services/mcpClientService";

// Add type definitions
interface TelegramUpdate {
	message?: {
		chat: {
			id: string;
		};
		from: {
			id: string;
		};
		text: string;
	};
	callback_query?: {
		message: {
			chat: {
				id: string;
			};
		};
		from: {
			id: string;
		};
		data: string;
		id: string;
	};
}

interface ProductUpdate {
	status: string;
	name?: string;
	alert_triggered?: string;
}

export async function handleUpdate(update: TelegramUpdate) {
	// Message handler
	if (update.message) {
		const chatId = update.message.chat.id;
		const userId = update.message.from.id;
		const text = update.message.text;

		// Handle commands
		if (text.startsWith("/")) {
			switch (true) {
				case /\/start/.test(text):
					await handleStartCommand(chatId, userId);
					break;
				case /\/help/.test(text):
					await handleHelpCommand(chatId);
					break;
				case /\/list/.test(text):
					await handleListCommand(chatId, userId);
					break;
				default:
					bot.sendMessage(
						chatId,
						"❌ Unknown command. Use /help to see available commands."
					);
			}
			return;
		}

		// Handle any other text as a query to MCP
		try {
			const response = await fetch("/api/mcp-client", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query: text }),
			});

			if (!response.ok) {
				throw new Error("Failed to process query");
			}

			const data = await response.json();
			bot.sendMessage(chatId, data.response, { parse_mode: "Markdown" });
		} catch (error) {
			logger.error("Error processing query:", error);
			bot.sendMessage(
				chatId,
				"❌ Sorry, I couldn't process your request."
			);
		}
	}

	// Handle callback queries
	if (update.callback_query) {
		await handleCallbackQuery(update.callback_query);
	}
}

async function handleStartCommand(chatId: string, userId: string) {
	// Create or retrieve user context
	const user = await createOrUpdateUser(userId);
	// Update to use session service
	await sessionService.setSession(userId, {});

	try {
		const welcomeMessage = `
    🛒 *Welcome to E-commerce Price Assistant Bot!*

    I can help you track product prices across multiple platforms and alert you when prices change.

    *Available Commands:*
    /search <query> - Search for products across platforms
    /track <product_url> - Track a product for price changes
    /list - View your tracked products
    /compare <query> - Compare prices across platforms
    /update - Update prices for your tracked products
    /help - Show this help message

    *Supported Platforms:*
    • Amazon 🛍️
    • eBay 🏷️
    • Walmart 🛒
    • Etsy 🎨
    • Best Buy 💻
    • Home Depot 🔨

    Just send me a product URL or use the commands above to get started!
    `;

		bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });
	} catch (error) {
		logger.error("Error in handleStartCommand:", error);
		bot.sendMessage(
			chatId,
			"❌ Failed to initialize user session. Please try again."
		);
	}
}

async function handleHelpCommand(chatId: string) {
	const helpMessage = `
    🔧 *Bot Commands & Usage*

    *Search Products:*
    /search wireless headphones
    /search <query> - Search across all platforms

    *Manage Tracking:*
    /list - View tracked products
    /update - Update all tracked prices
    /remove <number> - Remove tracked product by number

    *Compare Prices:*
    /compare iPhone 15 - Compare across platforms

    *Other:*
    /help - Show this message

    *Tip:* You can also just send me a product URL directly!
    `;

	bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
}

async function handleListCommand(chatId: string, userId: string) {
	bot.sendMessage(chatId, "📊 Fetching your tracked products...");

	try {
		const results = await getUserTrackedProducts({
			userId: userId,
			include_price_history: false,
		});

		logger.info("User tracked products: ", { userId, results });

		const transformedResults = (results || []).map((product) => ({
			...product,
			first_tracked: (product.createdAt || new Date()).toISOString(),
			update_count: product.prices?.length || 0,
			price_history_count: product.prices?.length || 0,
			target_price: product.target_price ?? undefined,
			tracking_type: product.tracking_type as
				| "target_price"
				| "price_change",
		}));
		const message = formatTrackedProducts(transformedResults);

		if (results && results.length > 0) {
			const keyboard = {
				inline_keyboard: [
					[{ text: "🔄 Update Prices", callback_data: "update_all" }],
					// [
					// 	{
					// 		text: "📊 View Statistics",
					// 		callback_data: "view_stats",
					// 	},
					// ],
					...results.map((product: Product) => [
						{
							text: "Remove (UnTrack)",
							callback_data: `remove_${product.id}`,
						},
					]),
				],
			};

			bot.sendMessage(chatId, message, {
				parse_mode: "Markdown",
				reply_markup: keyboard,
			});
		} else {
			bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
		}
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		bot.sendMessage(
			chatId,
			`❌ Failed to fetch tracked products: ${errorMessage}`
		);
	}
}

async function handleCallbackQuery(
	callbackQuery: TelegramUpdate["callback_query"]
) {
	if (!callbackQuery) return;

	const chatId = callbackQuery.message.chat.id;
	const userId = callbackQuery.from.id;
	const data = callbackQuery.data;

	if (data === "update_all") {
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Updating prices...",
		});

		try {
			const productsUrl = await getAllTrackedProducts();
			logger.info("Product URLs: ", productsUrl);
			const results = await callMCPServer("get_price_update", {
				urls: productsUrl.map((prod: Product) => prod.url),
			});
			let message = `🔄 Updated ${results.summary.successful_updates} products successfully!`;

			if (results.summary.alerts_triggered > 0) {
				message += `\n🚨 ${results.summary.alerts_triggered} price alerts triggered!`;
			}

			bot.sendMessage(chatId, message);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(chatId, `❌ Update failed: ${errorMessage}`);
		}
	} else if (data === "view_stats") {
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Fetching statistics...",
		});

		try {
			const stats = await callMCPServer("session_stats", {});
			let message = "📊 *Statistics*\n\n```\n" + stats + "\n```";
			bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(
				chatId,
				`❌ Failed to fetch stats: ${errorMessage}`
			);
		}
	} else if (data.startsWith("track_")) {
		const url = data.replace("track_", "");
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Adding to tracking...",
		});

		try {
			await trackProduct(userId, url);
			bot.sendMessage(chatId, "✅ Product added to price tracking!");
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(chatId, `❌ Failed to track: ${errorMessage}`);
		}
	} else if (data.startsWith("remove_")) {
		const productId = data.replace("remove_", "");
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Removing product from tracking list...",
		});

		try {
			await untrackProduct(userId, productId);
			bot.sendMessage(chatId, "✅ Product removed from price tracking!");
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(chatId, `❌ Failed to track: ${errorMessage}`);
		}
	} else if (data.startsWith("target_")) {
		const url = data.replace("target_", "");
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Please set target price...",
		});

		// Update to use session service
		await sessionService.setSession(userId, { pendingTargetUrl: url });

		bot.sendMessage(
			chatId,
			'💰 Please send your target price (e.g., "$50" or "50")'
		);
	} else if (data.startsWith("mcp_")) {
		const query = data.replace("mcp_", "");
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Processing MCP query...",
		});

		try {
			const response = await mcpClientService.processQuery(query);
			bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(
				chatId,
				`❌ Failed to process query: ${errorMessage}`
			);
		}
	}
}
