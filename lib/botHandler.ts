import {
	telegramBot as bot,
	userSessions,
	userTrackedProducts,
	callMCPServer,
	formatSearchResults,
	formatPriceComparison,
} from "./telegramBot";
import { formatTrackedProducts } from "./telegramBot";

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
				case /\/search/.test(text):
					await handleSearchCommand(chatId, text);
					break;
				case /\/help/.test(text):
					await handleHelpCommand(chatId);
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
	const welcomeMessage = `
    🛒 *Welcome to E-commerce Price Tracker Bot!*

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

		const keyboard = {
			inline_keyboard: results.map((product: { url: string }) => [
				{ text: "📈 Track", callback_data: `track:${product.url}` },
				{ text: "🎯 Target", callback_data: `target:${product.url}` },
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

    *Track Products:*
    /track https://amazon.com/dp/... - Track for price changes
    /track https://amazon.com/dp/... $50 - Track with target price

    *Manage Tracking:*
    /list - View tracked products
    /update - Update all tracked prices
    /remove <number> - Remove tracked product by number

    *Compare Prices:*
    /compare iPhone 15 - Compare across platforms

    *Other:*
    /stats - View your usage statistics
    /help - Show this message

    *Tip:* You can also just send me a product URL directly!
    `;

	bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
}

async function handleListCommand(chatId: string, userId: string) {
	bot.sendMessage(chatId, "📊 Fetching your tracked products...");

	try {
		const results = await callMCPServer("get_tracked_products", {
			include_price_history: false,
		});

		const message = formatTrackedProducts(results.products || []);

		if (results.products && results.products.length > 0) {
			const keyboard = {
				inline_keyboard: [
					[{ text: "🔄 Update Prices", callback_data: "update_all" }],
					[
						{
							text: "📊 View Statistics",
							callback_data: "view_stats",
						},
					],
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
		const results = await callMCPServer("update_tracked_prices", {});

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

async function handleStatsCommand(chatId: string) {
	try {
		const stats = await callMCPServer("session_stats", {});

		let message = "📈 *Your Usage Statistics*\n\n";
		message += "```\n" + stats + "\n```";

		bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		bot.sendMessage(
			chatId,
			`❌ Failed to fetch statistics: ${errorMessage}`
		);
	}
}

async function handleCompareCommand(chatId: string, query: string) {
	bot.sendMessage(chatId, "⚖️ Comparing prices across platforms...");

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
			include_reviews: false,
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
			const results = await callMCPServer("update_tracked_prices", {});
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
			await callMCPServer("track_product", { url });
			bot.sendMessage(chatId, "✅ Product added to price tracking!");
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

		// Store URL in user session for target price input
		if (!userSessions.has(userId)) {
			userSessions.set(userId, {});
		}
		userSessions.get(userId).pendingTargetUrl = url;

		bot.sendMessage(
			chatId,
			'💰 Please send your target price (e.g., "$50" or "50")'
		);
	}
}
