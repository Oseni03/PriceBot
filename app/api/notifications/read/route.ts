import { NextResponse } from "next/server";
import { markAllNotificationsAsRead } from "@/services/notifications";
import { getUser } from "@/services/user";

export async function POST() {
	try {
		const user = await getUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		await markAllNotificationsAsRead(user.id);
		return NextResponse.json({
			success: true,
			message: "All notifications marked as read.",
		});
	} catch (error) {
		console.error("Failed to mark notifications as read:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
