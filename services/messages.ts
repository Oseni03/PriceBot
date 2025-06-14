"use server";

import { COOKIE_NAME } from "@/lib/constants";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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
