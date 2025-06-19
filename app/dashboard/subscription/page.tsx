"use client";

import SubscriptionPlans from "@/components/subscription-plans";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface UsageStats {
	tokensUsed: number;
	tokenLimit: number;
	productsTracked: number;
	productLimit: number;
}

export default function SubscriptionPage() {
	const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
	const [loading, setLoading] = useState(true);
	const searchParams = useSearchParams();
	const paymentStatus = searchParams.get("payment");
	const txRef = searchParams.get("tx_ref");

	useEffect(() => {
		if (paymentStatus === "success") {
			toast.success("Payment successful! Your credits have been added.");
		}
	}, [paymentStatus]);

	useEffect(() => {
		async function fetchUsageStats() {
			try {
				const response = await fetch("/api/subscriptions/usage");
				if (!response.ok)
					throw new Error("Failed to fetch usage stats");
				const data = await response.json();
				setUsageStats(data);
			} catch (error) {
				console.error("Error fetching usage stats:", error);
				toast.error("Failed to load usage statistics");
			} finally {
				setLoading(false);
			}
		}

		fetchUsageStats();
	}, [paymentStatus]); // Refresh stats after payment

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!usageStats) {
		return <SubscriptionPlans />;
	}

	return (
		<div className="container mx-auto py-12">
			<h1 className="text-3xl font-bold mb-8">Your Subscription</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
				<Card className="p-6">
					<h3 className="text-lg font-semibold mb-4">Token Usage</h3>
					<Progress
						value={
							(usageStats.tokensUsed / usageStats.tokenLimit) *
							100
						}
						className="mb-2"
					/>
					<p className="text-sm text-muted-foreground">
						{usageStats.tokensUsed} / {usageStats.tokenLimit} tokens
						used
					</p>
				</Card>

				<Card className="p-6">
					<h3 className="text-lg font-semibold mb-4">
						Product Tracking
					</h3>
					<Progress
						value={
							(usageStats.productsTracked /
								usageStats.productLimit) *
							100
						}
						className="mb-2"
					/>
					<p className="text-sm text-muted-foreground">
						{usageStats.productsTracked} / {usageStats.productLimit}{" "}
						products tracked
					</p>
				</Card>
			</div>

			<div className="mt-8">
				<h2 className="text-2xl font-bold mb-6">Upgrade Your Plan</h2>
				<SubscriptionPlans />
			</div>
		</div>
	);
}
