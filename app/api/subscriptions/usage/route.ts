import { NextResponse } from "next/server";
import { CreditService } from "@/services/credits";
import { getUser } from "@/services/user";

export async function GET() {
	try {
		const user = await getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		const { usage } = await CreditService.getUserCreditHistory(user.id);
		return NextResponse.json(usage);
	} catch (error: any) {
		console.error("Error fetching subscription usage:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch subscription usage" },
			{ status: 500 }
		);
	}
}
