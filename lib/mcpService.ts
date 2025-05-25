import axios from "axios";

export interface SearchProductParams {
	query: string;
	platforms?: ("amazon" | "ebay" | "walmart" | "etsy" | "bestbuy")[];
	max_results?: number;
}

export interface ProductDetailsParams {
	url: string;
	include_reviews?: boolean;
}

export interface ComparePricesParams {
	query?: string;
	urls?: string[];
	platforms?: ("amazon" | "ebay" | "walmart" | "etsy" | "bestbuy")[];
}

export interface TrackProductParams {
	url: string;
	name?: string;
	target_price?: number;
}

class MCPService {
	private async callTool(tool: string, params: any) {
		try {
			const response = await axios.post("/api/mcp", { tool, params });
			return response.data;
		} catch (error: any) {
			console.error(`MCP tool ${tool} error:`, error.message);
			throw new Error(error.response?.data?.error || error.message);
		}
	}

	async searchProducts(params: SearchProductParams) {
		return this.callTool("search_products", params);
	}

	async getProductDetails(params: ProductDetailsParams) {
		return this.callTool("get_product_details", params);
	}

	async comparePrices(params: ComparePricesParams) {
		return this.callTool("compare_prices", params);
	}

	async trackProduct(params: TrackProductParams) {
		return this.callTool("track_product", params);
	}

	async getTrackedProducts() {
		return this.callTool("get_tracked_products", {});
	}

	async updateTrackedPrices(url?: string) {
		return this.callTool("update_tracked_prices", { url });
	}

	async getSessionStats() {
		return this.callTool("session_stats", {});
	}
}

export const mcpService = new MCPService();
