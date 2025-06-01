// app/api/cron/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import logger from "@/lib/logger";
import { mcpClientService } from "@/lib/services/mcpClientService";
import { getAllTrackedProducts } from "@/services/products";
import { type Product } from "@/types/products";

export async function POST() {
	try {
		const headersList = await headers();
		const authHeader = headersList.get("authorization");

		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// 1. Get all tracked products
		const products = await getAllTrackedProducts();

		const updates: { productId: string; currentPrice: number }[] =
			await Promise.all(
				products.map(async (product: Product) => {
					try {
						const details =
							(await mcpClientService.getProductDetails({
								url: product.url,
							})) as { price: number };
						return {
							productId: product.id,
							currentPrice: details.price * 100, // Convert to cents
						};
					} catch (error) {
						logger.error(
							`Failed to get details for product ${product.id}:`,
							error
						);
						return null;
					}
				})
			);

		// 3. Filter out failed updates and update database
		const validUpdates = updates.filter(
			(update: { productId: string; currentPrice: number }) =>
				update !== null
		);

		// 4. Update products in database
		const response = await fetch(
			`${process.env.NEXTAUTH_URL}/api/mcp/update-prices`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ updates: validUpdates }),
			}
		);

		if (!response.ok) {
			throw new Error("Failed to update prices in database");
		}

		const results = await response.json();

		return NextResponse.json(
			{
				success: true,
				updated: validUpdates.length,
				failed: products.length - validUpdates.length,
				results,
			},
			{
				status: 200,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		logger.error("Cron job failed:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{
				status: 500,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json",
				},
			}
		);
	}
}

export function OPTIONS() {
	return NextResponse.json(
		{},
		{
			status: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		}
	);
}
