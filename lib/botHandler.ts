import logger from "./logger";
import { telegramBot as bot, formatTrackedProducts } from "./telegramBot";
import { registerPlatform, getUserByPlatform } from "@/services/user";
import { type Product } from "@/types/products";
import { BASE_URL } from "./constants";
import { getMessages } from "@/services/messages";

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
			// Get previous messages for context
			const previousMessages = await getMessages(user.id);

			// Send typing indicator
			await bot.sendChatAction(chatId, "typing");

			const response = await fetch(`${BASE_URL}/api/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: text,
					userId: user.id,
					messages: previousMessages.slice(-5), // Keep last 5 messages for context
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to process query");
			}

			// Handle streaming response
			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("No response body");
			}

			let accumulatedText = "";
			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6);
						if (data === "[DONE]") break;

						try {
							const parsed = JSON.parse(data);
							if (parsed.type === "text-delta") {
								accumulatedText += parsed.textDelta;
							}
						} catch (e) {
							// Ignore parsing errors for incomplete JSON
						}
					}
				}
			}

			// Format the response for Telegram's markdown v2
			const formattedResponse = formatTelegramMessage(accumulatedText);

			// Message already saved to database in the chat route
			// await createMessage(formattedResponse, "BOT", user.id);

			// Split long messages if needed (Telegram has a 4096 character limit)
			const messageChunks = splitMessage(formattedResponse);

			for (const chunk of messageChunks) {
				await bot.sendMessage(chatId, chunk, {
					parse_mode: "MarkdownV2",
					disable_web_page_preview: true,
				});
			}
		} catch (error) {
			logger.error("Error processing query:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			bot.sendMessage(
				chatId,
				`❌ Sorry, I couldn't process your request: ${errorMessage}\n\nPlease try again or use /help for available commands.`
			);
		}
	}

	// Handle callback queries
	if (update.callback_query) {
		logger.info("Telegram callback query: ", update.callback_query);
		await handleCallbackQuery(update.callback_query);
	}
}

// Helper function to format messages for Telegram
function formatTelegramMessage(text: string): string {
	// First, escape all special characters
	const escapedText = text
		.replace(/\*/g, "\\*") // Escape asterisks
		.replace(/_/g, "\\_") // Escape underscores
		.replace(/\[/g, "\\[") // Escape square brackets
		.replace(/\]/g, "\\]")
		.replace(/\(/g, "\\(") // Escape parentheses
		.replace(/\)/g, "\\)")
		.replace(/~/g, "\\~") // Escape tildes
		.replace(/`/g, "\\`") // Escape backticks
		.replace(/>/g, "\\>") // Escape greater than
		.replace(/#/g, "\\#") // Escape hash
		.replace(/\+/g, "\\+") // Escape plus
		.replace(/-/g, "\\-") // Escape minus
		.replace(/=/g, "\\=") // Escape equals
		.replace(/\|/g, "\\|") // Escape pipe
		.replace(/{/g, "\\{") // Escape curly braces
		.replace(/}/g, "\\}")
		.replace(/\./g, "\\.") // Escape dots
		.replace(/!/g, "\\!"); // Escape exclamation marks

	// Then, reapply markdown formatting with proper escaping
	return escapedText
		.replace(/\\\*([^*]+)\\\*/g, "*$1*") // Bold
		.replace(/\\_([^_]+)\\_/g, "_$1_") // Italic
		.replace(/\\\[([^\]]+)\\\]\\\(([^)]+)\\\)/g, "[$1]($2)"); // Links
}

// Helper function to split long messages
function splitMessage(text: string, maxLength: number = 4000): string[] {
	if (text.length <= maxLength) return [text];

	const chunks: string[] = [];
	let currentChunk = "";
	const lines = text.split("\n");

	for (const line of lines) {
		if (currentChunk.length + line.length + 1 > maxLength) {
			chunks.push(currentChunk.trim());
			currentChunk = line;
		} else {
			currentChunk += (currentChunk ? "\n" : "") + line;
		}
	}

	if (currentChunk) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}

async function handleStartCommand(chatId: string, from: TelegramUser) {
	// Create or retrieve user context
	const user = await registerPlatform({ ...from, platform: "TELEGRAM" });

	try {
		const welcomeMessage =
			formatTelegramMessage(`🛒 Welcome to E-commerce Price Assistant Bot!

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

Just send me a product URL or use the commands above to get started!`);

		await bot.sendMessage(chatId, welcomeMessage, {
			parse_mode: "MarkdownV2",
			disable_web_page_preview: true,
		});
	} catch (error) {
		logger.error("Error in handleStartCommand:", error);
		bot.sendMessage(
			chatId,
			"❌ Failed to initialize user session. Please try again."
		);
	}
}

async function handleHelpCommand(chatId: string) {
	const helpMessage = formatTelegramMessage(`🔧 Bot Commands & Usage

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
    • Daily summary of price changes`);

	await bot.sendMessage(chatId, helpMessage, {
		parse_mode: "MarkdownV2",
		disable_web_page_preview: true,
	});
}

async function handleUpdateCommand(chatId: string, userId: string) {
	bot.sendMessage(chatId, "🔄 Updating prices for your tracked products...");

	try {
		// Get user's tracked products
		const productsResponse = await fetch(
			`${BASE_URL}/api/products/user-products?userId=${userId}`,
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
					`${BASE_URL}/api/products/product-details`,
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
		await fetch(`${BASE_URL}/api/products/update-prices`, {
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
			`${BASE_URL}/api/products/user-products?userId=${userId}`,
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
			await fetch(`${BASE_URL}/api/products/user-products`, {
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
				`${BASE_URL}/api/products/user-products?productId=${productId}&userId=${user.id}`,
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
