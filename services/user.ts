"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createOrUpdateUser(userId: string) {
	return await prisma.user.upsert({
		where: { userId },
		update: {},
		create: {
			userId,
			createdAt: new Date(),
		},
	});
}
