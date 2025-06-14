"use client";

import { useState, useCallback } from "react";
import { BASE_URL, CREDIT_COSTS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@prisma/client";
import { createMessage } from "@/services/messages";

export function useChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	const sendMessage = useCallback(async (text: string) => {
		if (!text.trim() || !user) return;

		const userMessage: Message = await createMessage(text, "USER", user.id);

		setMessages((prev) => [...prev, userMessage]);

		try {
			setIsLoading(true);
			if (user) {
				let botMessage: Message;

				if (user.credits < CREDIT_COSTS.AI_CHAT) {
					botMessage = {
						id: (Date.now() + 1).toString(),
						text: "Top up your credit to continue chat",
						sender: "BOT",
						userId: "",
						timestamp: new Date(),
						updatedAt: new Date(),
					};
				} else {
					const response = await fetch(`${BASE_URL}/api/mcp/query`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ query: text, userId: user.id }),
					});

					if (!response.ok) {
						throw new Error("Failed to process query");
					}

					const data = await response.json();

					botMessage = await createMessage(
						data.response,
						"BOT",
						user.id
					);
				}

				setMessages((prev) => [...prev, botMessage]);
			} else {
				const unauthorizedMessage: Message = {
					id: (Date.now() + 1).toString(),
					text: "Sign in to use chat feature",
					sender: "BOT",
					userId: "",
					timestamp: new Date(),
					updatedAt: new Date(),
				};

				setMessages((prev) => [...prev, unauthorizedMessage]);
			}
		} catch (error) {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: "Sorry, I encountered an error processing your request. Please try again.",
				sender: "BOT",
				userId: "",
				timestamp: new Date(),
				updatedAt: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const clearMessages = useCallback(() => {
		setMessages([]);
	}, []);

	return {
		messages,
		isLoading,
		sendMessage,
		clearMessages,
	};
}
