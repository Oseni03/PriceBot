"use server";

import { COOKIE_NAME } from "@/lib/constants";
import { ProductError } from "../lib/errors/ProductError";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { TrackingProduct } from "@/types/products";

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
				userId,
			},
			include: {
				prices: include_price_history,
			},
		});
		return products;
	} catch (error) {
		logger.error("Failed to get user tracked products:", error);
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
		logger.error("Failed to get all tracked products:", error);
		throw new ProductError("Failed to fetch products", "DATABASE_ERROR");
	}
}

export async function updateAllProducts(
	data: {
		productId: string;
		currentPrice: number;
	}[]
) {
	try {
		if (!Array.isArray(data) || data.length === 0) {
			throw new ProductError("Invalid update data", "INVALID_INPUT", 400);
		}

		// Validate all items in data array
		data.forEach((item) => {
			if (!item.productId || typeof item.currentPrice !== "number") {
				throw new ProductError(
					"Invalid product data format",
					"INVALID_INPUT",
					400
				);
			}
		});

		const updates = data.map((item) =>
			prisma.product.update({
				where: { id: item.productId },
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
		logger.error("Failed to update products:", error);
		if (error instanceof ProductError) throw error;
		throw new ProductError("Failed to update products", "DATABASE_ERROR");
	}
}

export async function trackProduct(
	userId: string,
	productDetail: TrackingProduct
) {
	try {
		if (!userId || !productDetail.url) {
			throw new ProductError(
				"User ID and URL are required",
				"INVALID_INPUT",
				400
			);
		}

		if (!productDetail.url.startsWith("http")) {
			throw new ProductError("Invalid URL format", "INVALID_INPUT", 400);
		}

		return await prisma.product.create({
			data: {
				url: productDetail.url,
				name: productDetail.name, // This should be updated with actual product name
				platform: productDetail.platform, // This should be determined from URL
				tracking_type: productDetail.tracking_type,
				userId,
			},
		});
	} catch (error) {
		logger.error("Failed to track product:", error);
		if (error instanceof ProductError) throw error;
		throw new ProductError("Failed to track product", "DATABASE_ERROR");
	}
}

export async function untrackProduct(userId: string, productId: string) {
	try {
		const product = await prisma.product.findFirst({
			where: {
				id: productId,
				userId,
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
				userId,
			},
		});
	} catch (error) {
		logger.error("Failed to untrack product:", error);
		if (error instanceof ProductError) throw error;
		throw new ProductError("Failed to untrack product", "DATABASE_ERROR");
	}
}
