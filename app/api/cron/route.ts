// app/api/cron/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import logger from "@/lib/logger";
import { getAllTrackedProducts } from "@/services/products";

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

		const updates = await Promise.all(
			products.map(async (product) => {
				try {
					const detailResponse = await fetch(
						`${process.env.NEXTAUTH_URL}/api/products/product-details`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ url: product.url }), // Empty updates for now, will be handled by the service
						}
					);

					if (!detailResponse.ok) {
						throw new Error("Failed to update prices in database");
					}

					const details = await detailResponse.json();

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
			(update): update is { productId: string; currentPrice: number } =>
				update !== null
		);

		// Update prices for all tracked products
		const updateResponse = await fetch(
			`${process.env.NEXTAUTH_URL}/api/products/update-prices`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ updates: validUpdates }),
			}
		);

		if (!updateResponse.ok) {
			throw new Error("Failed to update prices in database");
		}

		const results = await updateResponse.json();

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
