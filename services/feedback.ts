"use server";

import { prisma } from "@/lib/prisma";
import { FeedbackInput } from "@/types/feedback";
import { FeedbackType } from "@prisma/client";

export async function createFeedback(feedback: FeedbackInput) {
	if (!feedback.userId || !feedback.message || !feedback.type) {
		throw new Error("Missing required feedback fields");
	}

	if (!Object.values(FeedbackType).includes(feedback.type)) {
		throw new Error("Invalid feedback type");
	}

	return await prisma.feedback.create({
		data: {
			type: feedback.type,
			message: feedback.message,
			userId: feedback.userId,
		},
	});
}

export async function getUserFeedback(userId: string) {
	return await prisma.feedback.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});
}
