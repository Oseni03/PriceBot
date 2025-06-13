import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { flutterwaveService } from "@/lib/services/flutterwaveService";
import { CREDIT_PLANS } from "@/lib/constants";

type PlanType = keyof typeof CREDIT_PLANS;

export async function POST(req: Request) {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get(COOKIE_NAME)?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await verifyAuthToken(token);
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		if (!user.email) {
			return NextResponse.json(
				{ error: "User email needed" },
				{ status: 400 }
			);
		}

		const body = await req.json();
		const { plan, name } = body as {
			plan: PlanType;
			name: string;
		};

		const payment = await flutterwaveService.initiatePayment({
			userId: user.uid,
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
