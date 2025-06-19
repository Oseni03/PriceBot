"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CREDIT_PLANS } from "@/lib/constants";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PlanType = keyof typeof CREDIT_PLANS;

function isValidPlanKey(key: any): key is PlanType {
    return key && typeof key === "string" && key in CREDIT_PLANS;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planKey = searchParams.get("plan");
    const plan = isValidPlanKey(planKey) ? CREDIT_PLANS[planKey] : undefined;

    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!plan) {
        return <div className="p-8">Invalid or missing plan.</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/payments/charge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: planKey,
                    card: { cardNumber, expiry, cvv, name },
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Payment failed");

            // Redirect to subscription page with payment status
            router.push(`/dashboard/subscription?payment=success&tx_ref=${data.data?.tx_ref || ''}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-12 max-w-lg">
            <Card>
                <CardHeader className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Checkout</h2>
                    <div className="text-lg font-semibold">{plan.name}</div>
                    <div className="text-3xl font-bold mt-2">${plan.price}</div>
                    <div className="text-purple-600 font-semibold mt-2">{plan.credits} credits</div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Name on Card"
                            className="w-full border p-2 rounded"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Card Number"
                            className="w-full border p-2 rounded"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            required
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-1/2 border p-2 rounded"
                                value={expiry}
                                onChange={e => setExpiry(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="CVV"
                                className="w-1/2 border p-2 rounded"
                                value={cvv}
                                onChange={e => setCvv(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                            {loading ? "Processing..." : `Pay $${plan.price}`}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 