import { createFeedback, getUserFeedback } from "@/services/feedback";
import { FeedbackInput } from "@/types/feedback";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as FeedbackInput;
		const userId = request.headers.get("X-User-ID");

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const feedback = await createFeedback({
			...body,
			userId,
		});

		return NextResponse.json(feedback);
	} catch (error) {
		console.error("Error creating feedback:", error);
		return NextResponse.json(
			{ error: "Failed to create feedback" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const userId = request.headers.get("X-User-ID");
		const searchParams = request.nextUrl.searchParams;
		const type = searchParams.get("type");

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const feedbacks = await getUserFeedback(userId);

		return NextResponse.json(feedbacks);
	} catch (error) {
		console.error("Error fetching feedback:", error);
		return NextResponse.json(
			{ error: "Failed to fetch feedback" },
			{ status: 500 }
		);
	}
}
