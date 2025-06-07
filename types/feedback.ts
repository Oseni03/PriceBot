import { FeedbackStatus, FeedbackType } from "@prisma/client";

export interface FeedbackInput {
	type: FeedbackType;
	message: string;
	userId: string;
}

export interface Feedback extends FeedbackInput {
	id: string;
	status: FeedbackStatus;
	createdAt: Date;
	updatedAt: Date;
}
