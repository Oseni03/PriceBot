"use client";

import { useState, useCallback, useEffect } from "react";
import { BASE_URL, CREDIT_COSTS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@prisma/client";
import {
	createMessage,
	deleteMessages,
	getMessages,
} from "@/services/messages";

export function useChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	// Load previous messages when user changes
	useEffect(() => {
		if (user) {
			fetchMessages();
		} else {
			setMessages([]);
		}
	}, [user]);

	const fetchMessages = async () => {
		if (!user) return;

		try {
			const messages = await getMessages(user.id);
			setMessages(messages);
		} catch (error) {
			console.error("Error fetching messages:", error);
		}
	};

	const sendMessage = useCallback(
		async (text: string) => {
			if (!text.trim() || !user) return;

			try {
				setIsLoading(true);

				// Create user message
				const userMessage: Message = await createMessage(
					text,
					"USER",
					user.id
				);
				setMessages((prev) => [...prev, userMessage]);

				// Check credits
				if (user.credits < CREDIT_COSTS.AI_CHAT) {
					const botMessage: Message = await createMessage(
						"⚠️ You don't have enough credits to continue chatting. Please top up your credits to continue.",
						"BOT",
						user.id
					);
					setMessages((prev) => [...prev, botMessage]);
					return;
				}

				// Send to chat API with streaming
				const response = await fetch(`${BASE_URL}/api/chat`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: text,
						userId: user.id,
						messages: messages.slice(-6, -1),
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

				// Refresh messages to get the latest from database
				await fetchMessages();
			} catch (error) {
				console.error("Error in chat:", error);
				const errorMessage = await createMessage(
					"Sorry, I encountered an error processing your request. Please try again.",
					"BOT",
					user.id
				);
				setMessages((prev) => [...prev, errorMessage]);
			} finally {
				setIsLoading(false);
			}
		},
		[user, messages]
	);

	const clearMessages = useCallback(async () => {
		if (!user) return;

		try {
			await deleteMessages(user.id);
			setMessages([]);
		} catch (error) {
			console.error("Error clearing messages:", error);
		}
	}, [user]);

	return {
		messages,
		isLoading,
		sendMessage,
		clearMessages,
	};
}
