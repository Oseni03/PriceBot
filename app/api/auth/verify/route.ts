import { verifyAuthToken } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const authToken = req.cookies.get("firebaseAuthToken")?.value;
		if (!authToken) {
			return NextResponse.json(
				{ verified: false, error: "No auth token provided" },
				{ status: 401 }
			);
		}
		const decodedToken = await verifyAuthToken(authToken);
		return NextResponse.json({ verified: true, user: decodedToken });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		return NextResponse.json(
			{ verified: false, error: errorMessage },
			{ status: 401 }
		);
	}
}
