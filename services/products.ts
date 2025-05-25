"use server";

import { PrismaClient } from "@prisma/client";
import { ProductError } from "../lib/errors/ProductError";

const prisma = new PrismaClient();

export async function getUserTrackedProducts({
	userId,
	include_price_history = false,
}: {
	userId: string;
	include_price_history?: boolean;
}) {
	try {
		if (!userId) {
			throw new ProductError("User ID is required", "INVALID_INPUT", 400);
		}

		const products = await prisma.product.findMany({
			where: {
				User: {
					userId: userId,
				},
			},
			include: {
				prices: include_price_history,
			},
		});
		return products;
	} catch (error) {
		console.error("Failed to get user tracked products:", error);
		if (error instanceof ProductError) throw error;
		throw new ProductError("Failed to fetch products", "DATABASE_ERROR");
	}
}

export async function getAllTrackedProducts() {
	try {
		const products = await prisma.product.findMany({
			include: {
				prices: {
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
				},
			},
		});
		return products;
	} catch (error) {
		console.error("Failed to get all tracked products:", error);
		throw new ProductError("Failed to fetch products", "DATABASE_ERROR");
	}
}

export async function updateAllProducts(
	data: {
		id: string;
		currentPrice: number;
	}[]
) {
	try {
		if (!Array.isArray(data) || data.length === 0) {
			throw new ProductError("Invalid update data", "INVALID_INPUT", 400);
		}

		// Validate all items in data array
		data.forEach((item) => {
			if (!item.id || typeof item.currentPrice !== "number") {
				throw new ProductError(
					"Invalid product data format",
					"INVALID_INPUT",
					400
				);
			}
		});

		const updates = data.map((item) =>
			prisma.product.update({
				where: { id: item.id },
				data: {
					prices: {
						create: {
							amount: item.currentPrice,
						},
					},
				},
			})
		);

		return await prisma.$transaction(updates);
	} catch (error) {
		console.error("Failed to update products:", error);
		if (error instanceof ProductError) throw error;
		throw new ProductError("Failed to update products", "DATABASE_ERROR");
	}
}

export async function trackProduct(userId: string, url: string) {
	try {
		if (!userId || !url) {
			throw new ProductError(
				"User ID and URL are required",
				"INVALID_INPUT",
				400
			);
		}

		if (!url.startsWith("http")) {
			throw new ProductError("Invalid URL format", "INVALID_INPUT", 400);
		}

		const user = await prisma.user.findUnique({
			where: { userId },
		});

		if (!user) {
			throw new ProductError("User not found", "NOT_FOUND", 404);
		}

		return await prisma.product.create({
			data: {
				url,
				name: "New Product", // This should be updated with actual product name
				platform: new URL(url).hostname, // This should be determined from URL
				tracking_type: "price",
				userId: user.id,
			},
		});
	} catch (error) {
		console.error("Failed to track product:", error);
		if (error instanceof ProductError) throw error;
		throw new ProductError("Failed to track product", "DATABASE_ERROR");
	}
}

export async function untrackProduct(userId: string, productId: string) {
	try {
		if (!userId || !productId) {
			throw new ProductError(
				"User ID and Product ID are required",
				"INVALID_INPUT",
				400
			);
		}

		const user = await prisma.user.findUnique({
			where: { userId },
		});

		if (!user) {
			throw new ProductError("User not found", "NOT_FOUND", 404);
		}

		const product = await prisma.product.findFirst({
			where: {
				id: productId,
				userId: user.id,
			},
		});

		if (!product) {
			throw new ProductError(
				"Product not found or unauthorized",
				"NOT_FOUND",
				404
			);
		}

		return await prisma.product.delete({
			where: {
				id: productId,
				userId: user.id,
			},
		});
	} catch (error) {
		console.error("Failed to untrack product:", error);
		if (error instanceof ProductError) throw error;
		throw new ProductError("Failed to untrack product", "DATABASE_ERROR");
	}
}
