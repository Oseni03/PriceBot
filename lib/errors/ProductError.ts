export class ProductError extends Error {
	constructor(
		message: string,
		public code:
			| "NOT_FOUND"
			| "UNAUTHORIZED"
			| "INVALID_INPUT"
			| "DATABASE_ERROR",
		public status: number = 500
	) {
		super(message);
		this.name = "ProductError";
	}
}
