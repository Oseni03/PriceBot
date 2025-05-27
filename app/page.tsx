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
import Image from "next/image";
import Link from "next/link";

export default function PriceTrackerLanding() {
	const telegramBotURL = "https://t.me/PriceMorphBot";

	const supportedPlatforms = [
		{ name: "Amazon", logo: "/placeholder.svg?height=40&width=120" },
		{ name: "Etsy", logo: "/placeholder.svg?height=40&width=120" },
		{ name: "Best Buy", logo: "/placeholder.svg?height=40&width=120" },
		{ name: "eBay", logo: "/placeholder.svg?height=40&width=120" },
		{ name: "Walmart", logo: "/placeholder.svg?height=40&width=120" },
		{ name: "Target", logo: "/placeholder.svg?height=40&width=120" },
	];

	const features = [
		{
			icon: <Globe className="h-6 w-6" />,
			title: "Smart Product Search",
			description:
				"Search and discover products across multiple ecommerce platforms from one place",
		},
		{
			icon: <ShoppingCart className="h-6 w-6" />,
			title: "Detailed Product View",
			description:
				"View comprehensive product information, reviews, and price history charts",
		},
		{
			icon: <TrendingDown className="h-6 w-6" />,
			title: "Price Tracking",
			description:
				"Track unlimited products and set custom price alerts for your target prices",
		},
		{
			icon: <Bell className="h-6 w-6" />,
			title: "Real-time Notifications",
			description:
				"Get instant Telegram notifications when prices drop or reach your target price",
		},
	];

	const testimonials = [
		{
			name: "Sarah Johnson",
			role: "Smart Shopper",
			content:
				"The product search feature is amazing! I can compare prices across all stores instantly and the notifications are spot-on.",
			rating: 5,
		},
		{
			name: "Mike Chen",
			role: "Deal Hunter",
			content:
				"Love the detailed product views and price history charts. Saved $300 on electronics last month!",
			rating: 5,
		},
		{
			name: "Emily Davis",
			role: "Budget Conscious",
			content:
				"The Telegram notifications are so convenient. I get alerted immediately when my tracked items go on sale.",
			rating: 5,
		},
	];

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
							<TrendingDown className="h-5 w-5 text-white" />
						</div>
						<span className="font-bold text-xl">PriceMorph</span>
					</div>
					<nav className="hidden md:flex items-center gap-6">
						<Link
							href="#features"
							className="text-gray-600 hover:text-gray-900"
						>
							Features
						</Link>
						<Link
							href="#how-it-works"
							className="text-gray-600 hover:text-gray-900"
						>
							How it Works
						</Link>
						<Link
							href="#testimonials"
							className="text-gray-600 hover:text-gray-900"
						>
							Reviews
						</Link>
					</nav>
					<Button variant="outline" asChild>
						<Link
							href={telegramBotURL}
							target="_blank"
							rel="noopener noreferrer"
						>
							<MessageCircle className="h-4 w-4 mr-2" />
							Get Started
						</Link>
					</Button>
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-20 px-4 min-h-screen flex items-center justify-center">
				<div className="container mx-auto text-center max-w-4xl">
					<Badge className="mb-4 bg-gray-100 text-gray-800 hover:bg-gray-100">
						🚀 Track prices across 50+ stores
					</Badge>
					<h1 className="text-5xl md:text-6xl font-bold mb-6 text-black">
						Never Miss a Deal Again
					</h1>
					<p className="text-xl text-gray-600 mb-8 leading-relaxed">
						Search products across Amazon, Etsy, Best Buy, and more.
						View detailed product information, track prices, and get
						instant Telegram notifications when your target prices
						are reached. Never miss a deal again!
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<Button
							size="lg"
							className="bg-black hover:bg-gray-800 text-lg px-8 py-6"
							asChild
						>
							<Link
								href={telegramBotURL}
								target="_blank"
								rel="noopener noreferrer"
							>
								<MessageCircle className="h-5 w-5 mr-2" />
								Start Tracking on Telegram
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
									<div className="h-12 w-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
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
							<div className="h-12 w-12 bg-black rounded-lg flex items-center justify-center mb-6">
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
						<div className="bg-gray-50 rounded-2xl p-8">
							<div className="bg-white rounded-lg shadow-lg p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="h-8 w-8 bg-gray-200 rounded"></div>
									<div className="h-4 bg-gray-200 rounded flex-1"></div>
								</div>
								<div className="space-y-3">
									<div className="h-3 bg-gray-100 rounded"></div>
									<div className="h-3 bg-gray-100 rounded w-3/4"></div>
									<div className="h-3 bg-gray-100 rounded w-1/2"></div>
								</div>
							</div>
						</div>

						{/* Price Tracking Feature */}
						<div className="lg:order-2">
							<div className="bg-gray-50 rounded-2xl p-8">
								<div className="bg-white rounded-lg shadow-lg p-6">
									<div className="flex items-center justify-between mb-4">
										<span className="text-sm text-gray-500">
											Price History
										</span>
										<TrendingDown className="h-5 w-5 text-green-600" />
									</div>
									<div className="h-32 bg-gray-200 rounded mb-4"></div>
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
							<div className="h-12 w-12 bg-black rounded-lg flex items-center justify-center mb-6">
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
							<div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
							<div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
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
							<div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
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
							<div className="h-16 w-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
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

			{/* Testimonials */}
			<section
				id="testimonials"
				className="py-20 px-4 bg-white min-h-screen flex items-center justify-center"
			>
				<div className="container mx-auto max-w-6xl">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							What Our Users Say
						</h2>
						<p className="text-xl text-gray-600">
							Join thousands of satisfied customers
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<Card key={index} className="border-0 shadow-lg">
								<CardContent className="pt-6">
									<div className="flex mb-4">
										{[...Array(testimonial.rating)].map(
											(_, i) => (
												<Star
													key={i}
													className="h-5 w-5 text-yellow-400 fill-current"
												/>
											)
										)}
									</div>
									<p className="text-gray-600 mb-6">
										"{testimonial.content}"
									</p>
									<div>
										<div className="font-semibold">
											{testimonial.name}
										</div>
										<div className="text-sm text-gray-500">
											{testimonial.role}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-4 bg-black">
				<div className="container mx-auto text-center max-w-4xl">
					<h2 className="text-4xl font-bold text-white mb-6">
						Ready to Start Saving Money?
					</h2>
					<p className="text-xl text-gray-300 mb-8">
						Join our Telegram bot now and never pay full price again
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6"
							asChild
						>
							<Link
								href={telegramBotURL}
								target="_blank"
								rel="noopener noreferrer"
							>
								<MessageCircle className="h-5 w-5 mr-2" />
								Join Telegram Bot
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

			{/* Footer */}
			<footer className="py-12 px-4 bg-gray-900 text-white">
				<div className="container mx-auto max-w-6xl">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
									<TrendingDown className="h-5 w-5 text-white" />
								</div>
								<span className="font-bold text-xl">
									PriceMorph
								</span>
							</div>
							<p className="text-gray-400">
								The smartest way to track prices and save money
								on your favorite products.
							</p>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Product</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link
										href="/#features"
										className="hover:text-white"
									>
										Features
									</Link>
								</li>
								{/* <li>
									<Link href="#" className="hover:text-white">
										Pricing
									</Link>
								</li>
								<li>
									<Link href="#" className="hover:text-white">
										API
									</Link>
								</li> */}
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Support</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link href="#" className="hover:text-white">
										Help Center
									</Link>
								</li>
								<li>
									<Link href="#" className="hover:text-white">
										Contact
									</Link>
								</li>
								<li>
									<Link href="#" className="hover:text-white">
										Status
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Company</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link href="#" className="hover:text-white">
										About
									</Link>
								</li>
								<li>
									<Link href="#" className="hover:text-white">
										Privacy
									</Link>
								</li>
								<li>
									<Link href="#" className="hover:text-white">
										Terms
									</Link>
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
						<p>&copy; 2024 PriceMorph. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
