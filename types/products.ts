export interface Product {
	id: string;
	name: string;
	platform: string;
	url: string;
	prices?: any[];
	createdAt?: Date;
	target_price?: number;
	tracking_type?: "target_price" | "price_change";
}
