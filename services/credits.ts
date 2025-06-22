import { prisma } from "@/lib/prisma";
import { FREE_SIGNUP_CREDITS, CREDIT_COSTS } from "@/lib/constants";

type CreditAction = keyof typeof CREDIT_COSTS;
// DeepSeek pricing as of June 2024 (USD per 1K tokens)
const DEEPSEEK_PRICING = { prompt: 0.002, completion: 0.002 }; // $0.002/1K tokens for both

const PROFIT_MARGIN = 0.7; // 70%
const CREDITS_PER_DOLLAR = 1000; // 1 credit = $0.001

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

	static async useCredits(userId: string, action: CreditAction, usage: any) {
		const { promptTokens = 0, completionTokens = 0 } = usage;

		// Calculate cost in USD
		const promptCost = (promptTokens / 1000) * DEEPSEEK_PRICING.prompt;
		const completionCost =
			(completionTokens / 1000) * DEEPSEEK_PRICING.completion;
		const baseCost = promptCost + completionCost;

		// Add profit margin
		const finalCost = baseCost * (1 + PROFIT_MARGIN);

		// Convert to credits
		const creditsToDeduct = Math.ceil(finalCost * CREDITS_PER_DOLLAR);

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { credits: true },
		});

		if (!user || user.credits < creditsToDeduct) {
			throw new Error("Insufficient credits");
		}

		// Create a transaction to ensure atomicity
		const [updatedUser, dbUsage] = await prisma.$transaction([
			prisma.user.update({
				where: { id: userId },
				data: { credits: { decrement: creditsToDeduct } },
			}),
			prisma.creditUsage.create({
				data: {
					userId,
					creditsUsed: creditsToDeduct,
					action,
					metadata: {
						promptTokens,
						completionTokens,
						model: "deepseek",
						baseCost,
						finalCost,
						creditsToDeduct,
					},
				},
			}),
		]);

		return {
			remainingCredits: updatedUser.credits,
			usage: dbUsage,
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
