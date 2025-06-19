export type MessageSender = "USER" | "BOT";

export interface Message {
	id: string;
	text: string;
	sender: MessageSender;
	timestamp: Date;
	userId: string;
	updatedAt: Date;
}
