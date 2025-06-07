import logger from "./logger";
import { telegramBot as bot, formatTrackedProducts } from "./telegramBot";
import { createOrUpdateUser, registerPlatform } from "@/services/user";
import { sessionService } from "./services/sessionService";
import { type Product } from "@/types/products";

// Add baseUrl constant
const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Add type definitions
interface TelegramUpdate {
	message?: {
		chat: {
			id: string;
		};
		from: {
			id: number;
			first_name?: string;
			language_code?: string;
			username?: string;
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

export interface TelegramUser {
	id: number | string;
	first_name?: string;
	language_code?: string;
	username?: string;
}

export async function handleUpdate(update: TelegramUpdate) {
	logger.info("Telegram webhook update: ", { data: update });
	// Message handler
	if (update.message) {
		const chatId = update.message.chat.id;
		const userId = update.message.from.id;
		const text = update.message.text;

		logger.info("Telegram message", update.message);

		// Handle commands
		if (text.startsWith("/")) {
			switch (true) {
				case /\/start/.test(text):
					await handleStartCommand(chatId, update.message.from);
					break;
				case /\/help/.test(text):
					await handleHelpCommand(chatId);
					break;
				case /\/list/.test(text):
					await handleListCommand(chatId, userId.toString());
					break;
				case /\/update/.test(text):
					await handleUpdateCommand(chatId, userId.toString());
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
			const response = await fetch(`${baseUrl}/api/mcp/query`, {
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
		logger.info("Telegram callback query: ", update.callback_query);
		await handleCallbackQuery(update.callback_query);
	}
}

async function handleStartCommand(chatId: string, from: TelegramUser) {
	// Create or retrieve user context
	const user = await registerPlatform({ ...from, platform: "TELEGRAM" });
	// Update to use session service
	await sessionService.setSession(from.id.toString(), {});

	try {
		const welcomeMessage = `🛒 *Welcome to E-commerce Price Assistant Bot\!*

*Available Commands:*
    /track - Track a product for price changes
    /list - View your tracked products
    /update - Update prices for your tracked products
    /help - Show this help message

*Supported Platforms:*
    • Amazon 🛍️
    • eBay 🏷️
    • Walmart 🛒
    • Etsy 🎨
    • Best Buy 💻
    • Home Depot 🔨

Just send me a product URL or use the commands above to get started\!`;

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
	const helpMessage = `🔧 *Bot Commands & Usage*

    *Manage Tracking:*
    /track <url> - Track a product for price changes
    /list - View tracked products
    /update - Update all tracked prices

*Other Commands:*
    /help - Show this message

*Tip:* You can send me a product URL directly or type your query to search products!`;

	bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
}

async function handleUpdateCommand(chatId: string, userId: string) {
	bot.sendMessage(chatId, "🔄 Updating prices for your tracked products...");

	try {
		// Get user's tracked products
		const productsResponse = await fetch(
			`${baseUrl}/api/mcp/user-products`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId }),
			}
		);
		const products = await productsResponse.json();

		if (!products.length) {
			bot.sendMessage(chatId, "You don't have any tracked products yet!");
			return;
		}

		// Get current prices and update
		const updates = await Promise.all(
			products.map(async (product: Product) => {
				const detailsResponse = await fetch(
					`${baseUrl}/api/mcp/product-details`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: product.url }),
					}
				);
				const details = await detailsResponse.json();
				return {
					productId: product.id,
					currentPrice: details.price * 100, // Convert to cents
				};
			})
		);

		// Update products in database
		await fetch(`${baseUrl}/api/mcp/update-prices`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ updates }),
		});

		const message = `✅ Successfully updated prices for ${updates.length} products!`;
		bot.sendMessage(chatId, message);
	} catch (error: unknown) {
		logger.error("Error in handleUpdateCommand:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		bot.sendMessage(chatId, `❌ Failed to update prices: ${errorMessage}`);
	}
}

async function handleListCommand(chatId: string, userId: string) {
	bot.sendMessage(chatId, "📊 Fetching your tracked products...");

	try {
		const response = await fetch(`${baseUrl}/api/mcp/user-products`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, includePriceHistory: false }),
		});
		const results = await response.json();

		logger.info("User tracked products: ", { userId, results });

		const transformedResults = (results || []).map((product: Product) => ({
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
		await handleUpdateCommand(chatId, userId);
	} else if (data.startsWith("track_")) {
		const url = data.replace("track_", "");
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Adding to tracking...",
		});

		try {
			await fetch(`${baseUrl}/api/mcp/track`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId,
					productDetail: {
						url,
						name: "New Product",
						platform: new URL(url).hostname,
					},
				}),
			});
			bot.sendMessage(chatId, "✅ Product added to price tracking!");
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(chatId, `❌ Failed to track: ${errorMessage}`);
		}
	} else if (data.startsWith("remove_")) {
		const productId = data.replace("remove_", "");
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Removing from tracking...",
		});

		try {
			await fetch(`${baseUrl}/api/mcp/untrack`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, productId }),
			});
			bot.sendMessage(chatId, "✅ Product removed from price tracking!");
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(chatId, `❌ Failed to track: ${errorMessage}`);
		}
	}
	// ...existing code for target_ handling...
}
