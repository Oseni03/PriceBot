export interface Product {
	id: string;
	name: string;
	platform:
		| "amazon"
		| "ebay"
		| "walmart"
		| "etsy"
		| "bestbuy"
		| "homedepot"
		| "zara"
		| "unknown";
	url: string;
	prices?: any[];
	createdAt?: Date;
	target_price?: number | null | undefined;
	tracking_type?: "target_price" | "price_change";
}

export interface TrackingProduct {
	name: string;
	platform:
		| "amazon"
		| "ebay"
		| "walmart"
		| "etsy"
		| "bestbuy"
		| "homedepot"
		| "zara"
		| "unknown";
	target_price?: number | null | undefined;
	tracking_type: "target_price" | "price_change";
	url: string;
}
