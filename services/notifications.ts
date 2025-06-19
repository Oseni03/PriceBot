import { prisma } from "@/lib/prisma";

export async function createNotification(userId: string, message: string) {
	return prisma.notification.create({
		data: {
			userId,
			message,
		},
	});
}

export async function getNotifications(userId: string) {
	return prisma.notification.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});
}

export async function markAllNotificationsAsRead(userId: string) {
	return prisma.notification.updateMany({
		where: { userId, read: false },
		data: { read: true },
	});
}

// Helper functions for common notifications
export async function notifyLowCredits(userId: string, creditsLeft: number) {
	return createNotification(
		userId,
		`Your credits are running low! You have ${creditsLeft} credits remaining.`
	);
}

export async function notifyNewDeals(
	userId: string,
	productName: string,
	platform: string
) {
	return createNotification(
		userId,
		`New deals found for ${productName} on ${platform}!`
	);
}

export async function notifyPaymentSuccess(userId: string, credits: number) {
	return createNotification(
		userId,
		`Payment successful! ${credits} credits have been added to your account.`
	);
}

export async function notifyPriceAlert(
	userId: string,
	productName: string,
	newPrice: number,
	currency: string = "USD"
) {
	return createNotification(
		userId,
		`Price alert! ${productName} is now ${currency}${newPrice}.`
	);
}
