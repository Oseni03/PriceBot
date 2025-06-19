import { NextResponse } from "next/server";
import { CREDIT_PLANS } from "@/lib/constants";
import { getUser } from "@/services/user";
import { notifyPaymentSuccess } from "@/services/notifications";

type PlanType = keyof typeof CREDIT_PLANS;

function isValidPlanKey(key: any): key is PlanType {
	return key && typeof key === "string" && key in CREDIT_PLANS;
}

async function chargeCard({
	userId,
	email,
	plan,
	amount,
	card,
	name,
}: {
	userId: string;
	email: string;
	plan: PlanType;
	amount: number;
	card: {
		cardNumber: string;
		expiry: string; // MM/YY
		cvv: string;
		name: string;
	};
	name: string;
}) {
	const [exp_month, exp_year] = card.expiry.split("/");
	const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

	const payload = {
		card_number: card.cardNumber,
		cvv: card.cvv,
		expiry_month: exp_month.trim(),
		expiry_year: ("20" + exp_year.trim()).slice(-4), // e.g. 24 -> 2024
		currency: "USD",
		amount,
		fullname: card.name,
		email,
		tx_ref,
		redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?payment=success&tx_ref=${tx_ref}`,
	};

	const response = await fetch(
		"https://api.flutterwave.com/v3/charges?type=card",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		}
	);

	const data = await response.json();

	if (data.status === "success" || data.data?.status === "successful") {
		// Create a success notification
		await notifyPaymentSuccess(userId, CREDIT_PLANS[plan].credits);
		return { success: true, message: "Payment successful", data };
	} else if (
		data.status === "success" &&
		data.data?.processor_response?.toLowerCase().includes("otp")
	) {
		// Handle OTP/3DS step if needed (not implemented here)
		return {
			success: false,
			message: "OTP/3DS authentication required",
			data,
		};
	} else {
		return {
			success: false,
			message: data.message || "Payment failed",
			data,
		};
	}
}

export async function POST(req: Request) {
	try {
		const user = await getUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		const body = await req.json();
		const { plan, card } = body;
		if (!isValidPlanKey(plan) || !card) {
			return NextResponse.json(
				{ error: "Missing or invalid plan or card details" },
				{ status: 400 }
			);
		}
		const planDetails = CREDIT_PLANS[plan];
		if (!planDetails) {
			return NextResponse.json(
				{ error: "Invalid plan" },
				{ status: 400 }
			);
		}
		// Process payment with chargeCard
		const paymentResult = await chargeCard({
			userId: user.id,
			email: user.email,
			plan,
			amount: planDetails.price,
			card,
			name: card.name,
		});
		if (!paymentResult.success) {
			return NextResponse.json(
				{
					error: paymentResult.message || "Payment failed",
					data: paymentResult.data,
				},
				{ status: 400 }
			);
		}
		return NextResponse.json({ success: true, data: paymentResult.data });
	} catch (error: any) {
		console.error("Payment charge error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
