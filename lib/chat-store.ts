import { Message } from "ai";
import { generateId } from "ai";
import { getMessages, createMessage } from "@/services/messages";
import { convertDBMessageToAI } from "@/lib/message-utils";

export async function createChat(): Promise<string> {
	const id = generateId(); // generate a unique chat ID
	// No need to create a file, just return the ID
	// The chat will be created when the first message is sent
	return id;
}

export async function loadChat(id: string): Promise<Message[]> {
	try {
		const dbMessages = await getMessages(id);
		return dbMessages.map(convertDBMessageToAI);
	} catch (error) {
		console.error("Error loading chat:", error);
		return [];
	}
}
