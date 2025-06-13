import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { flutterwaveService } from "@/lib/services/flutterwaveService";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
	try {
		const body = await req.text();
		const signature = (await headers()).get("verif-hash");

		if (!signature) {
			return NextResponse.json(
				{ error: "Missing signature" },
				{ status: 400 }
			);
		}

		// Verify webhook signature
		if (!flutterwaveService.verifyWebhookSignature(signature, body)) {
			return NextResponse.json(
				{ error: "Invalid signature" },
				{ status: 400 }
			);
		}

		const event = JSON.parse(body);

		switch (event.event) {
			case "charge.completed": {
				const { id } = event.data;
				const verificationResponse =
					await flutterwaveService.verifyPayment(id);

				if (verificationResponse.data.status === "successful") {
					await flutterwaveService.handleSuccessfulPayment(
						verificationResponse
					);
				}
				break;
			}

			// Add more event handlers as needed
		}

		return NextResponse.json({ received: true });
	} catch (error: any) {
		console.error("Webhook error:", error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 }
		);
	}
}
