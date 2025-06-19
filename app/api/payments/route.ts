import { NextResponse } from "next/server";
import { flutterwaveService } from "@/lib/services/flutterwaveService";
import { CREDIT_PLANS } from "@/lib/constants";
import { getUser } from "@/services/user";

type PlanType = keyof typeof CREDIT_PLANS;

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
		const { plan, name } = body as {
			plan: PlanType;
			name: string;
		};

		const payment = await flutterwaveService.initiatePayment({
			userId: user.id,
			email: user.email,
			plan,
			name,
			phoneNumber: "",
		});

		return NextResponse.json(payment);
	} catch (error: any) {
		console.error("Payment initiation error:", error);
		return NextResponse.json(
			{ error: error.message },
			{ status: error.status || 500 }
		);
	}
}
