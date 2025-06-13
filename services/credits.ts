import { prisma } from "@/lib/prisma";
import { FREE_SIGNUP_CREDITS, CREDIT_COSTS } from "@/lib/constants";

export class CreditService {
	static async getUserCredits(userId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { credits: true },
		});
		return user?.credits ?? 0;
	}

	static async addCredits(userId: string, amount: number) {
		const user = await prisma.user.update({
			where: { id: userId },
			data: { credits: { increment: amount } },
		});
		return user.credits;
	}

	static async useCredits(
		userId: string,
		action: keyof typeof CREDIT_COSTS,
		metadata?: any
	) {
		const creditsNeeded = CREDIT_COSTS[action];
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { credits: true },
		});

		if (!user || user.credits < creditsNeeded) {
			throw new Error("Insufficient credits");
		}

		// Create a transaction to ensure atomicity
		const [updatedUser, usage] = await prisma.$transaction([
			prisma.user.update({
				where: { id: userId },
				data: { credits: { decrement: creditsNeeded } },
			}),
			prisma.creditUsage.create({
				data: {
					userId,
					creditsUsed: creditsNeeded,
					action,
					metadata: metadata ?? {},
				},
			}),
		]);

		return {
			remainingCredits: updatedUser.credits,
			usage,
		};
	}

	static async createCreditPurchase({
		userId,
		amount,
		credits,
		txRef,
	}: {
		userId: string;
		amount: number;
		credits: number;
		txRef: string;
	}) {
		return prisma.creditPurchase.create({
			data: {
				userId,
				amount,
				credits,
				status: "PENDING",
				flutterwaveTxRef: txRef,
			},
		});
	}

	static async completeCreditPurchase(txRef: string, transactionId: string) {
		const purchase = await prisma.creditPurchase.update({
			where: { flutterwaveTxRef: txRef },
			data: {
				status: "COMPLETED",
				flutterwaveTransactionId: transactionId,
			},
		});

		if (purchase.status === "COMPLETED") {
			await this.addCredits(purchase.userId, purchase.credits);
		}

		return purchase;
	}

	static async getUserCreditHistory(userId: string) {
		const [purchases, usage] = await Promise.all([
			prisma.creditPurchase.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
			}),
			prisma.creditUsage.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
			}),
		]);

		return {
			purchases,
			usage,
		};
	}
}
