"use server";

import { prisma } from "@/lib/prisma";

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
