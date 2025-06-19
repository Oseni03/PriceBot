"use client"

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { CREDIT_PLANS } from "@/lib/constants";

type PlanType = keyof typeof CREDIT_PLANS;

export default function SubscriptionPlans() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);

	const handlePurchaseCredits = async (plan: PlanType) => {
		if (!user) {
			toast.error("Please sign in to purchase credits");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/payments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					plan,
					email: user.email,
					userId: user.id,
					amount: CREDIT_PLANS[plan].price,
					credits: CREDIT_PLANS[plan].credits,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to process payment");
			}

			const data = await response.json();

			// Save current plan selection for post-payment verification
			sessionStorage.setItem("selectedPlan", plan);
			sessionStorage.setItem("userEmail", user.email);

			// Redirect to Flutterwave payment page
			window.location.href = data.data.link;
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to process payment"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto py-12">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold mb-4">Purchase Credits</h2>
				<p className="text-gray-600">
					Choose the credit package that works for you
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{(Object.keys(CREDIT_PLANS) as PlanType[]).map((planKey) => {
					const plan = CREDIT_PLANS[planKey];
					const isPopular = planKey === "PLUS";

					return (
						<Card
							key={planKey}
							className={`relative border-2 transition-all ${isPopular
								? "border-purple-300 hover:border-purple-600"
								: "hover:border-purple-300"
								}`}
						>
							{isPopular && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2">
									<Badge className="bg-purple-600">
										Best Value
									</Badge>
								</div>
							)}

							<CardHeader className="text-center">
								<h3 className="text-2xl font-bold">
									{plan.name}
								</h3>
								<div className="text-3xl font-bold mt-4">
									${plan.price}
								</div>
							</CardHeader>

							<CardContent>
								<p className="text-purple-600 font-semibold text-center mb-6">
									{plan.credits} credits
								</p>

								<div className="space-y-4">
									<div className="space-y-2">
										{plan.features.map((feature, i) => (
											<div
												key={i}
												className="flex items-start gap-3"
											>
												<CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
												<span className="text-sm">
													{feature}
												</span>
											</div>
										))}
									</div>

									<Button
										className="w-full bg-purple-600 hover:bg-purple-700"
										onClick={() => {
											window.location.href = `/dashboard/checkout?plan=${planKey}`;
										}}
										disabled={loading}
									>
										{loading ? "Processing..." : "Purchase Credits"}
									</Button>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className="mt-12 text-center text-sm text-gray-600">
				<p>Need more credits? Contact us for custom packages.</p>
			</div>
		</div>
	);
}
