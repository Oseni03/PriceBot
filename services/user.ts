"use server";

import { prisma } from "@/lib/prisma";
import type { TelegramUser } from "@/lib/botHandler";

export async function createOrUpdateUser(user: TelegramUser) {
	return await prisma.user.upsert({
		where: { userId: user.id.toString() },
		update: {},
		create: {
			userId: user.id.toString(),
			firstName: user.first_name || "",
			languageCode: user.language_code || "",
			username: user.username || "",
			createdAt: new Date(),
		},
	});
}
