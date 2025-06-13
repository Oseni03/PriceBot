export const COOKIE_NAME = "firebaseAuthToken";
export const TELEGRAM_URL = "https://t.me/PriceMorphBot";
export const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const CREDIT_PLANS = {
	STARTER: {
		name: "500 Credits",
		price: 4.99,
		credits: 500,
		features: [
			"AI Shopping Assistant",
			"Product Search & Compare",
			"Valid for 6 months",
			"Email support",
		],
	},
	PLUS: {
		name: "2000 Credits",
		price: 14.99,
		credits: 2000,
		features: [
			"Everything in Starter",
			"Priority Support",
			"Advanced Analytics",
			"Best value for money",
			"Valid for 1 year",
		],
	},
	PRO: {
		name: "5000 Credits",
		price: 29.99,
		credits: 5000,
		features: [
			"Everything in Plus",
			"24/7 Priority Support",
			"Custom Integrations",
			"Bulk Tracking Features",
			"Valid for 1 year",
		],
	},
} as const;

// New users get 100 free credits on signup
export const FREE_SIGNUP_CREDITS = 100;

// Credit costs for different actions
export const CREDIT_COSTS = {
	PRODUCT_SEARCH: 1,
	PRICE_CHECK: 2,
	AI_CHAT: 5,
	PRICE_PREDICTION: 10,
} as const;
