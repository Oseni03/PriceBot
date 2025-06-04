"use server";

import { prisma } from "@/lib/prisma";
import type { TelegramUser } from "@/lib/botHandler";

export async function createOrUpdateUser(user: TelegramUser) {
	return await prisma.user.upsert({
		where: {
			platforms: {
				some: {
					AND: [
						{ platform: "TELEGRAM" },
						{ platformId: user.id.toString() },
					],
				},
			},
		},
		update: {
			firstName: user.first_name || "",
			languageCode: user.language_code || "",
			username: user.username || "",
		},
		create: {
			firstName: user.first_name || "",
			languageCode: user.language_code || "",
			username: user.username || "",
			platforms: {
				create: {
					platform: "TELEGRAM",
					platformId: user.id.toString(),
				},
			},
		},
		include: {
			platforms: true,
		},
	});
}
