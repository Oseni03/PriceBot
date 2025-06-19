import { CreditService } from "@/services/credits";
import { CREDIT_PLANS } from "../constants";

interface FlutterwaveConfig {
	publicKey: string;
	secretKey: string;
	encryptionKey: string;
}

interface PaymentInitResponse {
	status: string;
	message: string;
	data: {
		link: string;
	};
}

interface VerificationResponse {
	status: string;
	message: string;
	data: {
		id: number;
		tx_ref: string;
		flw_ref: string;
		amount: number;
		currency: string;
		meta: {
			userId: string;
			plan: keyof typeof CREDIT_PLANS;
		};
	};
}

export class FlutterwaveService {
	async handleSuccessfulPayment(verificationResponse: VerificationResponse) {
		const { data } = verificationResponse;
		const { tx_ref, flw_ref, meta } = data;

		// Update purchase record
		const purchase = await CreditService.completeCreditPurchase(
			tx_ref,
			flw_ref
		);

		// Get subscription plan details
		const planDetails = CREDIT_PLANS[meta.plan];

		// Create or update subscription
		const credits = await CreditService.addCredits(
			meta.userId,
			planDetails.credits
		);

		return { purchase, credits };
	}
	private static instance: FlutterwaveService;
	private baseUrl = "https://api.flutterwave.com/v3";

	private constructor(private config: FlutterwaveConfig) {}

	public static getInstance(): FlutterwaveService {
		if (!FlutterwaveService.instance) {
			FlutterwaveService.instance = new FlutterwaveService({
				publicKey: process.env.FLW_PUBLIC_KEY!,
				secretKey: process.env.FLW_SECRET_KEY!,
				encryptionKey: process.env.FLW_ENCRYPTION_KEY!,
			});
		}
		return FlutterwaveService.instance;
	}

	async initiatePayment(params: {
		userId: string;
		email: string;
		plan: keyof typeof CREDIT_PLANS;
		name: string;
		phoneNumber: string;
	}): Promise<PaymentInitResponse> {
		const { userId, email, plan, name, phoneNumber } = params;
		const planDetails = CREDIT_PLANS[plan];
		// Create payment record
		const txRef = `TX-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
		const payment = await CreditService.createCreditPurchase({
			userId,
			amount: planDetails.price,
			credits: planDetails.credits,
			txRef,
		});

		const response = await fetch(`${this.baseUrl}/payments`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.config.secretKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				tx_ref: payment.flutterwaveTxRef,
				amount: planDetails.price,
				currency: "USD",
				payment_type: "card",
				redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
				customer: {
					email,
					phonenumber: phoneNumber,
					name,
				},
				customizations: {
					title: `${planDetails.name} Plan Subscription`,
					description: `Subscription to ${planDetails.name} Plan`,
					logo: "https://your-logo-url.png",
				},
				meta: {
					userId,
					plan,
				},
			}),
		});

		return response.json();
	}

	async verifyPayment(transactionId: string) {
		const response = await fetch(
			`${this.baseUrl}/transactions/${transactionId}/verify`,
			{
				headers: {
					Authorization: `Bearer ${this.config.secretKey}`,
					"Content-Type": "application/json",
				},
			}
		);

		const verification = await response.json();
		if (verification.status === "success") {
			const { tx_ref } = verification.data;
			const plan = verification.data.meta
				.plan as keyof typeof CREDIT_PLANS;

			// Update payment status
			const payment = await CreditService.completeCreditPurchase(
				tx_ref,
				transactionId
			);

			// Create or update subscription
			await CreditService.addCredits(
				payment.userId,
				CREDIT_PLANS[plan].credits
			);
		}

		return verification;
	}

	async verifyWebhookSignature(
		signature: string,
		data: string
	): Promise<boolean> {
		return signature === this.config.secretKey;
	}
}

export const flutterwaveService = FlutterwaveService.getInstance();
