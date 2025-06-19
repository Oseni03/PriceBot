import { NextResponse } from "next/server";
import { getNotifications } from "@/services/notifications";
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
		const notifications = await getNotifications(user.id);
		return NextResponse.json(notifications);
	} catch (error) {
		console.error("Failed to fetch notifications:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
