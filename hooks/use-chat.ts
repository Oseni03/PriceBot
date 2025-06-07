"use client";

import { useState, useCallback } from "react";
import { BASE_URL } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export interface Message {
	id: string;
	text: string;
	sender: "user" | "bot";
	timestamp: Date;
}

export function useChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	const sendMessage = useCallback(async (text: string) => {
		if (!text.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			text,
			sender: "user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);

		try {
			setIsLoading(true);
			if (user) {
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

				const botMessage: Message = {
					id: (Date.now() + 1).toString(),
					text: data.response,
					sender: "bot",
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, botMessage]);
			} else {
				const unauthorizedMessage: Message = {
					id: (Date.now() + 1).toString(),
					text: "Sign in to use chat feature",
					sender: "bot",
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, unauthorizedMessage]);
			}
		} catch (error) {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: "Sorry, I encountered an error processing your request. Please try again.",
				sender: "bot",
				timestamp: new Date(),
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
