export interface MCPTool {
	name: string;
	description: string;
	input_schema: any;
}

export interface MCPResponse {
	content?: any;
	isError?: boolean;
	_meta?: any;
}

export interface MCPTrackProduct {
	userId: string;
	productDetail: {
		url: string;
		name: string;
		platform: string;
		target_price?: number;
		tracking_type?: string;
	};
}

export interface MCPUntrackProduct {
	userId: string;
	productId: string;
}

export interface MCPProductUpdate {
	currentPrice: number;
	productId: string;
}

export interface MCPUserTrackedProduct {
	userId: string;
	includePriceHistory?: boolean;
}
