// app/api/cron/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import logger from "@/lib/logger";
import { getAllTrackedProducts } from "@/services/products";

// Concurrency limit to avoid overwhelming external APIs
const CONCURRENCY_LIMIT = 5;

// Batch size for database updates
const BATCH_SIZE = 10;

// Helper function to process products in batches
async function processBatch(products: any[], batchSize: number) {
	const batches = [];
	for (let i = 0; i < products.length; i += batchSize) {
		batches.push(products.slice(i, i + batchSize));
	}

	const results = [];
	for (const batch of batches) {
		const batchResults = await Promise.allSettled(
			batch.map(async (product) => {
				try {
					const detailResponse = await fetch(
						`${process.env.NEXTAUTH_URL}/api/products/product-details`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ url: product.url }),
						}
					);

					if (!detailResponse.ok) {
						throw new Error(
							`HTTP ${detailResponse.status}: ${detailResponse.statusText}`
						);
					}

					const details = await detailResponse.json();

					return {
						productId: product.id,
						currentPrice: details.price * 100, // Convert to cents
						success: true,
					};
				} catch (error) {
					logger.error(
						`Failed to get details for product ${product.id}:`,
						error
					);
					return {
						productId: product.id,
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
						success: false,
					};
				}
			})
		);

		// Process batch results
		const successfulUpdates = batchResults
			.filter(
				(result): result is PromiseFulfilledResult<any> =>
					result.status === "fulfilled" && result.value.success
			)
			.map((result) => result.value);

		const failedUpdates = batchResults
			.filter(
				(result): result is PromiseFulfilledResult<any> =>
					result.status === "fulfilled" && !result.value.success
			)
			.map((result) => result.value);

		// Add successful updates to results
		results.push(...successfulUpdates);

		// Log failed updates
		if (failedUpdates.length > 0) {
			logger.warn(`Batch failed updates:`, failedUpdates);
		}

		// Small delay between batches to be respectful to external APIs
		if (batches.indexOf(batch) < batches.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	return results;
}

export async function POST() {
	const startTime = Date.now();

	try {
		logger.info("Starting price update cron job");

		// 1. Get all tracked products
		const products = await getAllTrackedProducts();
		logger.info(`Found ${products.length} products to update`);

		if (products.length === 0) {
			return NextResponse.json(
				{
					success: true,
					updated: 0,
					failed: 0,
					message: "No products to update",
					duration: Date.now() - startTime,
				},
				{
					status: 200,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Content-Type": "application/json",
					},
				}
			);
		}

		// 2. Process products in batches with concurrency control
		const validUpdates = await processBatch(products, CONCURRENCY_LIMIT);

		if (validUpdates.length === 0) {
			logger.warn("No successful price updates");
			return NextResponse.json(
				{
					success: true,
					updated: 0,
					failed: products.length,
					message: "No successful updates",
					duration: Date.now() - startTime,
				},
				{
					status: 200,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Content-Type": "application/json",
					},
				}
			);
		}

		// 3. Batch database updates
		const updateBatches = [];
		for (let i = 0; i < validUpdates.length; i += BATCH_SIZE) {
			updateBatches.push(validUpdates.slice(i, i + BATCH_SIZE));
		}

		const updateResults = [];
		for (const batch of updateBatches) {
			try {
				const updateResponse = await fetch(
					`${process.env.NEXTAUTH_URL}/api/products/update-prices`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ updates: batch }),
					}
				);

				if (!updateResponse.ok) {
					throw new Error(
						`Database update failed: ${updateResponse.status}`
					);
				}

				const result = await updateResponse.json();
				updateResults.push(result);
			} catch (error) {
				logger.error("Failed to update batch in database:", error);
				// Continue with other batches even if one fails
			}
		}

		const duration = Date.now() - startTime;
		const failed = products.length - validUpdates.length;

		logger.info(
			`Cron job completed in ${duration}ms. Updated: ${validUpdates.length}, Failed: ${failed}`
		);

		return NextResponse.json(
			{
				success: true,
				updated: validUpdates.length,
				failed,
				batches: updateBatches.length,
				duration,
				results: updateResults,
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
		const duration = Date.now() - startTime;
		logger.error("Cron job failed:", error);

		return NextResponse.json(
			{
				error: "Internal server error",
				details:
					error instanceof Error ? error.message : "Unknown error",
				duration,
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
