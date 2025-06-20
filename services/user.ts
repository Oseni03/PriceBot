"use server";

import { COOKIE_NAME } from "@/lib/constants";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { Platform, User } from "@prisma/client";
import { cookies } from "next/headers";

export interface NewPlatform {
	id: number | string;
	first_name?: string;
	language_code?: string;
	username?: string;
	platform: Platform;
}

export async function getUserByUserId(userId: string) {
	return await prisma.user.findUnique({
		where: { id: userId },
		include: { platforms: true },
	});
}

export async function getUser() {
	const cookieStore = await cookies();
	const authToken = cookieStore.get(COOKIE_NAME)?.value;

	if (!authToken) {
		throw new Error("Authentication required");
	}

	const decodedToken = await verifyAuthToken(authToken).catch(() => null);
	if (!decodedToken?.uid) {
		throw new Error("Invalid or expired authentication token");
	}

	return await getUserByUserId(decodedToken.uid);
}

export async function createOrUpdateUser(user: User) {
	return await prisma.user.upsert({
		where: {
			email: user.email,
		},
		update: {
			firstName: user.firstName || "",
			languageCode: user.languageCode || "",
			username: user.username || "",
		},
		create: {
			firstName: user.firstName || "",
			languageCode: user.languageCode || "",
			username: user.username || "",
			email: user.email,
			platforms: {
				create: {
					platform: "TELEGRAM",
					platformId: user.id.toString(),
				},
			},
			credits: user.credits,
		},
		include: {
			platforms: true,
		},
	});
}

export async function registerPlatform(platform: NewPlatform) {
	if (!platform.id || !platform.platform) {
		throw new Error("Platform ID and type are required");
	}

	const cookieStore = cookies();
	const authToken = (await cookieStore).get(COOKIE_NAME)?.value;

	if (!authToken) {
		throw new Error("Authentication token is missing");
	}

	const decodedToken = await verifyAuthToken(authToken).catch(() => null);
	if (!decodedToken?.uid) {
		throw new Error("Invalid or expired authentication token");
	}

	const platformId = platform.id.toString();

	try {
		return await prisma.user.update({
			where: { id: decodedToken.uid },
			data: {
				platforms: {
					connectOrCreate: {
						where: {
							platform_platformId: {
								platform: platform.platform,
								platformId: platformId,
							},
						},
						create: {
							platform: platform.platform,
							platformId,
						},
					},
				},
			},
			include: { platforms: true },
		});
	} catch (error) {
		throw new Error(
			`Failed to register platform: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
}

export async function getUserByPlatform(
	platformId: string | number,
	platform: Platform
) {
	try {
		const userPlatform = await prisma.userPlatform.findUnique({
			where: {
				platform_platformId: {
					platform,
					platformId: platformId.toString(),
				},
			},
			include: {
				user: true,
			},
		});

		if (!userPlatform) {
			throw new Error("User not found for platform");
		}

		return userPlatform.user;
	} catch (error) {
		throw new Error(
			`Failed to get user by platform: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
}
