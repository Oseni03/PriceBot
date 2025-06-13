"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Bell,
	TrendingDown,
	Star,
	ShoppingCart,
	MessageCircle,
	CheckCircle,
	ArrowRight,
	Smartphone,
	Globe,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import SubscriptionPlans from "@/components/subscription-plans";

export default function PriceTrackerLanding() {
	const features = [
		{
			icon: <Globe className="h-6 w-6" />,
			title: "AI-Powered Search",
			description:
				"Natural language search across multiple platforms. Just describe what you're looking for!",
		},
		{
			icon: <ShoppingCart className="h-6 w-6" />,
			title: "Smart Price Comparison",
			description:
				"AI analyzes prices across platforms to find the best deals and predicts price trends",
		},
		{
			icon: <TrendingDown className="h-6 w-6" />,
			title: "Intelligent Tracking",
			description:
				"AI monitors price patterns and suggests the best time to buy",
		},
		{
			icon: <MessageCircle className="h-6 w-6" />,
			title: "Conversational Shopping",
			description:
				"Chat naturally with our AI to find, compare and track products",
		},
	];

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<Header />

			{/* Hero Section */}
			<section className="py-20 px-4 min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
				<div className="container mx-auto text-center max-w-4xl">
					<Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
						🤖 AI-Powered Shopping Assistant
					</Badge>
					<h1 className="text-5xl md:text-6xl font-bold mb-6 text-black">
						Your AI Shopping Assistant
					</h1>
					<p className="text-xl text-gray-600 mb-8 leading-relaxed">
						Chat naturally with our AI to search products, compare
						prices, and track deals across multiple platforms. Let
						AI help you find the best time to buy!
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<Button
							size="lg"
							className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6"
							asChild
						>
							<Link href={"/dashboard/chat"}>
								<MessageCircle className="h-5 w-5 mr-2" />
								Chat with Morphe AI
								<ArrowRight className="h-5 w-5 ml-2" />
							</Link>
						</Button>
						{/* <Button
							size="lg"
							variant="outline"
							className="text-lg px-8 py-6"
						>
							<Globe className="h-5 w-5 mr-2" />
							View Demo
						</Button> */}
					</div>

					{/* Supported Platforms */}
					{/* <div className="mb-16">
						<p className="text-gray-500 mb-6">
							Trusted by thousands of smart shoppers
						</p>
						<div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
							{supportedPlatforms.map((platform, index) => (
								<div
									key={index}
									className="flex justify-center"
								>
									<Image
										src={
											platform.logo || "/placeholder.svg"
										}
										alt={platform.name}
										width={120}
										height={40}
										className="h-8 w-auto grayscale hover:grayscale-0 transition-all"
									/>
								</div>
							))}
						</div>
					</div> */}

					{/* Stats */}
					{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
						<div className="text-center">
							<div className="text-3xl font-bold text-black mb-2">
								$2.5M+
							</div>
							<div className="text-gray-600">Money Saved</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-gray-800 mb-2">
								50K+
							</div>
							<div className="text-gray-600">Active Users</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-gray-600 mb-2">
								1M+
							</div>
							<div className="text-gray-600">Items Tracked</div>
						</div>
					</div> */}
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="py-20 px-4 bg-white min-h-screen flex items-center justify-center"
			>
				<div className="container mx-auto max-w-6xl">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Why Choose PriceMorph?
						</h2>
						<p className="text-xl text-gray-600">
							Powerful features that make price tracking
							effortless
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<Card
								key={index}
								className="border-0 shadow-lg hover:shadow-xl transition-shadow"
							>
								<CardHeader className="text-center">
									<div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
										{feature.icon}
									</div>
									<CardTitle className="text-xl">
										{feature.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-center text-gray-600">
										{feature.description}
									</CardDescription>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Features Showcase */}
			<section
				className="py-20 px-4 min-h-screen flex items-center justify-center"
				id="features"
			>
				<div className="container mx-auto max-w-6xl">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Powerful Features at Your Fingertips
						</h2>
						<p className="text-xl text-gray-600">
							Everything you need to become a smart shopper
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						{/* Product Search Feature */}
						<div>
							<div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
								<Globe className="h-6 w-6 text-white" />
							</div>
							<h3 className="text-2xl font-bold mb-4">
								Universal Product Search
							</h3>
							<p className="text-gray-600 mb-6">
								Search millions of products across all major
								ecommerce platforms from a single interface.
								Find the best deals without visiting multiple
								websites.
							</p>
							<ul className="space-y-3">
								<li className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-black" />
									<span>
										Search across 50+ stores simultaneously
									</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-black" />
									<span>
										Advanced filters and sorting options
									</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-black" />
									<span>Real-time price comparison</span>
								</li>
							</ul>
						</div>
						<div className="bg-purple-50 rounded-2xl p-8">
							<div className="bg-white rounded-lg shadow-lg p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="h-8 w-8 bg-purple-200 rounded"></div>
									<div className="h-4 bg-purple-200 rounded flex-1"></div>
								</div>
								<div className="space-y-3">
									<div className="h-3 bg-purple-100 rounded"></div>
									<div className="h-3 bg-purple-100 rounded w-3/4"></div>
									<div className="h-3 bg-purple-100 rounded w-1/2"></div>
								</div>
							</div>
						</div>

						{/* Price Tracking Feature */}
						<div className="lg:order-2">
							<div className="bg-purple-50 rounded-2xl p-8">
								<div className="bg-white rounded-lg shadow-lg p-6">
									<div className="flex items-center justify-between mb-4">
										<span className="text-sm text-gray-500">
											Price History
										</span>
										<TrendingDown className="h-5 w-5 text-green-600" />
									</div>
									<div className="h-32 bg-purple-200 rounded mb-4"></div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">
											30 days ago
										</span>
										<span className="text-green-600 font-semibold">
											-25% ↓
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="lg:order-1">
							<div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
								<TrendingDown className="h-6 w-6 text-white" />
							</div>
							<h3 className="text-2xl font-bold mb-4">
								Smart Price Tracking
							</h3>
							<p className="text-gray-600 mb-6">
								Track unlimited products and set custom price
								alerts. Our AI monitors prices 24/7 and notifies
								you the moment your target price is reached.
							</p>
							<ul className="space-y-3">
								<li className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-black" />
									<span>Set custom target prices</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-black" />
									<span>Historical price charts</span>
								</li>
								<li className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-black" />
									<span>Price drop predictions</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section
				id="how-it-works"
				className="py-20 px-4 min-h-screen flex items-center justify-center"
			>
				<div className="container mx-auto max-w-4xl">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							How It Works
						</h2>
						<p className="text-xl text-gray-600">
							Get started in 3 simple steps
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="text-center">
							<div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<Globe className="h-8 w-8 text-black" />
							</div>
							<h3 className="text-xl font-semibold mb-4">
								1. Search Products
							</h3>
							<p className="text-gray-600">
								Search for any product across Amazon, Etsy, Best
								Buy, and other supported stores
							</p>
						</div>

						<div className="text-center">
							<div className="h-16 w-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
								<ShoppingCart className="h-8 w-8 text-black" />
							</div>
							<h3 className="text-xl font-semibold mb-4">
								2. View Details
							</h3>
							<p className="text-gray-600">
								See product information, current prices, and
								historical price trends
							</p>
						</div>

						<div className="text-center">
							<div className="h-16 w-16 bg-purple-300 rounded-full flex items-center justify-center mx-auto mb-6">
								<TrendingDown className="h-8 w-8 text-black" />
							</div>
							<h3 className="text-xl font-semibold mb-4">
								3. Track Prices
							</h3>
							<p className="text-gray-600">
								Add products to your watchlist and set your
								desired target prices
							</p>
						</div>

						<div className="text-center">
							<div className="h-16 w-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
								<Bell className="h-8 w-8 text-black" />
							</div>
							<h3 className="text-xl font-semibold mb-4">
								4. Get Notified
							</h3>
							<p className="text-gray-600">
								Receive instant Telegram alerts when prices drop
								to your target
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section
				id="pricing"
				className="py-20 px-4 bg-gray-50 min-h-screen flex items-center justify-center"
			>
				<SubscriptionPlans />
			</section>

			{/* CTA Section */}
			<section className="py-20 px-4 bg-purple-600">
				<div className="container mx-auto text-center max-w-4xl">
					<h2 className="text-4xl font-bold text-white mb-6">
						Ready to Shop Smarter with AI?
					</h2>
					<p className="text-xl text-purple-100 mb-8">
						Start chatting with Morphe AI and experience the future
						of shopping
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							className="bg-white text-black hover:bg-purple-100 text-lg px-8 py-6"
							asChild
						>
							<Link href="/dashboard/chat">
								<MessageCircle className="h-5 w-5 mr-2" />
								Chat with Morphe AI
								<ArrowRight className="h-5 w-5 ml-2" />
							</Link>
						</Button>
						{/* <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6"
            >
              <Smartphone className="h-5 w-5 mr-2" />
              Download App
            </Button> */}
					</div>

					<div className="mt-8 flex items-center justify-center gap-4 text-gray-300">
						<CheckCircle className="h-5 w-5 text-black" />
						<span>Free to use</span>
						<CheckCircle className="h-5 w-5 text-black" />
						<span>No credit card required</span>
						<CheckCircle className="h-5 w-5 text-black" />
						<span>Cancel anytime</span>
					</div>
				</div>
			</section>

			{/* Footer with updated branding */}
			<Footer />
		</div>
	);
}
