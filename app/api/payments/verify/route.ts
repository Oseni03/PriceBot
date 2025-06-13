import { NextResponse } from "next/server";
import { flutterwaveService } from "@/lib/services/flutterwaveService";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const status = searchParams.get("status");
	const tx_ref = searchParams.get("tx_ref");
	const transaction_id = searchParams.get("transaction_id");

	if (status === "successful" && transaction_id) {
		try {
			const verification = await flutterwaveService.verifyPayment(
				transaction_id
			);

			if (verification.status === "success") {
				return NextResponse.redirect(
					`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions?status=success`
				);
			}
		} catch (error) {
			console.error("Payment verification error:", error);
		}
	}

	return NextResponse.redirect(
		`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions?status=failed`
	);
}
