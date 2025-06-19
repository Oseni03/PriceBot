import { NextRequest } from "next/server";
import { updateAllProducts } from "@/services/products";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
	try {
		const { updates } = await request.json();

		if (!updates || !Array.isArray(updates)) {
			return new Response("updates array is required", { status: 400 });
		}

		const result = await updateAllProducts(updates);

		return new Response(JSON.stringify(result), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		logger.error("Error updating prices:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
