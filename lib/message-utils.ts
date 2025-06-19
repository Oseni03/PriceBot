import type { Message as AIMessage } from "ai";
import type { Message as DBMessage } from "@prisma/client";

export function convertDBMessageToAI(dbMessage: DBMessage): AIMessage {
	return {
		id: dbMessage.id,
		role: dbMessage.sender === "USER" ? "user" : "assistant",
		content: dbMessage.text,
		createdAt: dbMessage.timestamp,
	};
}

export function convertAIMessageToDB(
	aiMessage: AIMessage,
	userId: string
): Omit<DBMessage, "id" | "timestamp" | "updatedAt"> {
	return {
		text: aiMessage.content,
		sender: aiMessage.role === "user" ? "USER" : "BOT",
		userId,
	};
}
