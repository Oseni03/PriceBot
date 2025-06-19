"use server";

import { prisma } from "@/lib/prisma";

export async function createMessage(
	text: string,
	sender: "USER" | "BOT",
	userId: string
) {
	return await prisma.message.create({
		data: {
			userId,
			text,
			sender,
		},
	});
}

export async function getMessages(userId: string) {
	return await prisma.message.findMany({
		where: {
			userId,
		},
	});
}

export async function deleteMessages(userId: string) {
	return await prisma.message.deleteMany({
		where: {
			userId,
		},
	});
}
