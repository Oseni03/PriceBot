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
import { useUser } from "./context/UserContext";
import { createOrUpdateUser } from "@/services/user";

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

const { setSession, setUser } = useUser();

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
				case /\/search/.test(text):
					await handleSearchCommand(chatId, text);
					break;
				case /\/help/.test(text):
					await handleHelpCommand(chatId);
					break;
				case /\/list/.test(text):
					await handleListCommand(chatId, userId);
					break;
				case /\/update/.test(text):
					await handleUpdateCommand(chatId);
					break;
				case /\/compare/.test(text):
					await handleCompareCommand(chatId, text);
					break;
				// Add other command handlers...
			}
		}

		const match = await isProductUrl(text);
		// Handle URL messages
		if (match) {
			await handleProductUrl(chatId, match);
		}
	}

	// Callback query handler
	if (update.callback_query) {
		await handleCallbackQuery(update.callback_query);
	}
}

async function handleStartCommand(chatId: string, userId: string) {
	// Create or retrieve user context
	const user = await createOrUpdateUser(userId);
	// Set user context
	setUser({ id: user.userId });
	setSession(userId, {});

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

async function handleSearchCommand(chatId: string, text: string) {
	const query = text.replace("/search ", "");

	bot.sendMessage(
		chatId,
		"🔍 Searching for products... This may take a moment."
	);

	try {
		const results = await callMCPServer("search_products", {
			query,
			platforms: ["amazon", "ebay", "walmart"],
			max_results: 5,
		});
		logger.info("MCP search_products results: ", results);

		const keyboard = {
			inline_keyboard: results.map((product: { url: string }) => [
				{ text: "📈 Track", callback_data: `track_${product.url}` },
				{ text: "🎯 Target", callback_data: `target_${product.url}` },
			]),
		};

		await bot.sendMessage(chatId, formatSearchResults(results, query), {
			parse_mode: "Markdown",
			reply_markup: keyboard,
		});
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		bot.sendMessage(chatId, `❌ Search failed: ${errorMessage}`);
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

		const message = formatTrackedProducts(results.data || []);

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

async function handleUpdateCommand(chatId: string) {
	bot.sendMessage(chatId, "🔄 Updating prices for all tracked products...");

	try {
		const productsUrl = await getAllTrackedProducts();
		logger.info("Product URLs: ", productsUrl);

		const results = await callMCPServer("get_price_update", {
			urls: productsUrl.map((prod: Product) => prod.url),
		});
		logger.info("MCP products updates: ", results);

		await updateAllProducts(results.updates);

		let message = "📊 *Price Update Complete*\n\n";
		message += `✅ Successfully updated: ${results.summary.successful_updates}\n`;
		message += `❌ Failed updates: ${results.summary.failed_updates}\n`;
		message += `🚨 Alerts triggered: ${results.summary.alerts_triggered}\n\n`;

		if (results.updates && results.updates.length > 0) {
			message += "*Update Details:*\n";
			results.updates.slice(0, 5).forEach((update: ProductUpdate) => {
				if (update.status === "updated") {
					message += `✅ ${update.name || "Product"}\n`;
					if (update.alert_triggered) {
						message += `🚨 ${update.alert_triggered}\n`;
					}
				} else {
					message += `❌ Update failed\n`;
				}
			});

			if (results.updates.length > 5) {
				message += `\n... and ${results.updates.length - 5} more`;
			}
		}

		bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		bot.sendMessage(chatId, `❌ Price update failed: ${errorMessage}`);
	}
}

async function handleCompareCommand(chatId: string, text: string) {
	bot.sendMessage(chatId, "⚖️ Comparing prices across platforms...");

	const query = text.replace("/compare ", "");

	try {
		const results = await callMCPServer("compare_prices", {
			query,
			platforms: ["amazon", "ebay", "walmart", "bestbuy"],
		});

		const message = formatPriceComparison(results.results || []);
		bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		bot.sendMessage(chatId, `❌ Price comparison failed: ${errorMessage}`);
	}
}

async function isProductUrl(text: any) {
	if (!text || text.startsWith("/")) return;

	// Check if message contains a product URL
	const urlRegex =
		/(https?:\/\/(?:www\.)?(?:amazon|ebay|walmart|etsy|bestbuy|homedepot|zara)\.[\w\.]+\/[^\s]+)/i;
	const match = text.match(urlRegex);
	return match;
}

async function handleProductUrl(chatId: string, text: string[]) {
	const url = text[1];
	bot.sendMessage(chatId, "🔍 Detected product URL! Getting details...");

	try {
		const productDetails = await callMCPServer("get_product_details", {
			url,
			// include_reviews: false,
		});

		let message = "📦 *Product Details*\n\n";
		message += `🏪 Platform: ${productDetails.platform}\n`;
		message += `🔗 [View Product](${url})\n\n`;
		message += "💡 Would you like to track this product for price changes?";

		const keyboard = {
			inline_keyboard: [
				[
					{
						text: "📈 Track Price Changes",
						callback_data: `track_${url}`,
					},
					{
						text: "🎯 Set Target Price",
						callback_data: `target_${url}`,
					},
				],
			],
		};

		bot.sendMessage(chatId, message, {
			parse_mode: "Markdown",
			reply_markup: keyboard,
		});
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		bot.sendMessage(
			chatId,
			`❌ Failed to get product details: ${errorMessage}`
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

		// Store URL in session context
		setSession(userId, { pendingTargetUrl: url });

		bot.sendMessage(
			chatId,
			'💰 Please send your target price (e.g., "$50" or "50")'
		);
	}
}
