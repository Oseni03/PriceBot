export const COOKIE_NAME = "firebaseAuthToken";
export const TELEGRAM_URL = "https://t.me/PriceMorphBot";
export const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const CREDIT_PLANS = {
	STARTER: {
		name: "1,000 Credits",
		price: 9.99, // $0.001/credit, 70% margin
		credits: 1000,
		features: [
			"AI Shopping Assistant (OpenAI-powered)",
			"Product Search & Compare",
			"Valid for 6 months",
			"Email support",
			"~1M tokens (OpenAI GPT-4) equivalent",
		],
	},
	PLUS: {
		name: "5,000 Credits",
		price: 39.99,
		credits: 5000,
		features: [
			"Everything in Starter",
			"Priority Support",
			"Advanced Analytics",
			"Best value for money",
			"Valid for 1 year",
			"~5M tokens (OpenAI GPT-4) equivalent",
		],
	},
	PRO: {
		name: "15,000 Credits",
		price: 99.99,
		credits: 15000,
		features: [
			"Everything in Plus",
			"24/7 Priority Support",
			"Custom Integrations",
			"Bulk Tracking Features",
			"Valid for 1 year",
			"~15M tokens (OpenAI GPT-4) equivalent",
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
