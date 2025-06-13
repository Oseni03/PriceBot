import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { COOKIE_NAME } from "@/lib/constants";
import { CreditService } from "@/services/credits";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get(COOKIE_NAME)?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const decodedToken = await verifyAuthToken(token);

		if (!decodedToken) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		const { usage } = await CreditService.getUserCreditHistory(
			decodedToken.uid
		);
		return NextResponse.json(usage);
	} catch (error: any) {
		console.error("Error fetching subscription usage:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch subscription usage" },
			{ status: 500 }
		);
	}
}
