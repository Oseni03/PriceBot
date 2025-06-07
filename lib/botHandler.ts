import logger from "./logger";
import { telegramBot as bot, formatTrackedProducts } from "./telegramBot";
import { registerPlatform, getUserByPlatform } from "@/services/user";
import { type Product } from "@/types/products";
import { BASE_URL } from "./constants";

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
			id: number;
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
		const platformId = update.message.from.id;
		const text = update.message.text;

		logger.info("Telegram message", update.message);

		// Get the user's ID from their platform ID (Telegram ID)
		const user = await getUserByPlatform(platformId, "TELEGRAM");

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
					await handleListCommand(chatId, user.id);
					break;
				case /\/update/.test(text):
					await handleUpdateCommand(chatId, user.id);
					break;
				case /^\/bug (.+)/.test(text):
					await handleFeedbackCommand(chatId, user.id, text, "BUG");
					break;
				case /^\/feature (.+)/.test(text):
					await handleFeedbackCommand(
						chatId,
						user.id,
						text,
						"FEATURE"
					);
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
			const response = await fetch(`${BASE_URL}/api/mcp/query`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: text,
					userId: user.id,
				}),
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
				"❌ Sorry, I couldn't process your request. Please try registering with /start first."
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
	// // Update to use session service
	// await sessionService.setSession(from.id.toString(), user);

	try {
		const welcomeMessage = `🛒 *Welcome to E-commerce Price Assistant Bot\!*

*Available Commands:*
    /start - Start the bot and see welcome message
    /track - Track a product for price changes
    /list - View your tracked products
    /update - Update prices for your tracked products
    /help - Show all commands and usage info
    /remove - Remove a product from tracking
    /target - Set a target price for tracked product
    /search - Search for products across platforms

*Supported Platforms:*
    • Amazon 🛍️
    • eBay 🏷️
    • Walmart 🛒
    • Etsy 🎨
    • Best Buy 💻
    • Home Depot 🔨

*Feedback & Support:*
    /bug - Report a bug or issue
    /feature - Submit a feature request

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

*Product Management:*
    /track <url> - Track a product for price changes
    /list - View all your tracked products
    /update - Update prices for all tracked products
    /remove - Remove a product from tracking
    /target <product_id> <price> - Set target price alert

*Search & Discovery:*
    /search <query> - Search products across platforms
    /start - Initialize or restart the bot
    /help - Show this help message

*Feedback & Support:*
    /bug <description> - Report a bug or issue
    /feature <description> - Submit a feature request

*Usage Tips:*
• Send any product URL directly to start tracking
• Use /list to manage your tracked products
• Set price alerts with /target command
• Regular updates happen automatically

*Price Alerts:* You'll receive notifications when:
    • Prices drop below your target
    • Significant price changes occur
    • Daily summary of price changes`;

	bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
}

async function handleUpdateCommand(chatId: string, userId: string) {
	bot.sendMessage(chatId, "🔄 Updating prices for your tracked products...");

	try {
		// Get user's tracked products
		const productsResponse = await fetch(
			`${BASE_URL}/api/mcp/user-products?userId=${userId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-User-ID": userId,
				},
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
					`${BASE_URL}/api/mcp/product-details`,
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
		await fetch(`${BASE_URL}/api/mcp/update-prices`, {
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
		const response = await fetch(
			`${BASE_URL}/api/mcp/user-products?userId=${userId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-User-ID": userId,
				},
			}
		);
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
	const platformUserId = callbackQuery.from.id;
	const data = callbackQuery.data;

	// Get user's ID from their platform ID
	const user = await getUserByPlatform(platformUserId, "TELEGRAM");

	if (data === "update_all") {
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Updating prices...",
		});
		await handleUpdateCommand(chatId, user.id);
	} else if (data.startsWith("track_")) {
		const url = data.replace("track_", "");
		bot.answerCallbackQuery(callbackQuery.id, {
			text: "Adding to tracking...",
		});
		try {
			await fetch(`${BASE_URL}/api/mcp/user-products`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-User-ID": user.id,
				},
				body: JSON.stringify({
					url,
					userId: user.id,
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
			await fetch(
				`${BASE_URL}/api/mcp/user-products?productId=${productId}&userId=${user.id}`,
				{
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
				}
			);
			bot.sendMessage(chatId, "✅ Product removed from price tracking!");
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(chatId, `❌ Failed to track: ${errorMessage}`);
		}
	}
	// ...existing code for target_ handling...
}

// Add new feedback handler function
async function handleFeedbackCommand(
	chatId: string,
	userId: string,
	text: string,
	type: "BUG" | "FEATURE"
) {
	const message = text.split(" ").slice(1).join(" "); // Remove command part
	if (!message) {
		bot.sendMessage(
			chatId,
			`❌ Please provide a ${type.toLowerCase()} description.\nExample: /${type.toLowerCase()} description here`
		);
		return;
	}

	try {
		await fetch(`${BASE_URL}/api/feedback`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-User-ID": userId,
			},
			body: JSON.stringify({
				type,
				message,
				userId,
			}),
		});

		const responseMessage =
			type === "BUG"
				? "🐛 Thank you for reporting this bug! We'll look into it."
				: "💡 Thank you for the feature suggestion! We'll consider it for future updates.";

		bot.sendMessage(chatId, responseMessage);
	} catch (error) {
		logger.error(`Error handling ${type.toLowerCase()} feedback:`, error);
		bot.sendMessage(
			chatId,
			`❌ Failed to submit ${type.toLowerCase()} feedback. Please try again later.`
		);
	}
}
