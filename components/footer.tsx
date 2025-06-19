import React from "react";
import { TrendingDown } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
	return (
		<footer className="py-12 px-4 bg-gray-900 text-white">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div>
						<div className="flex items-center gap-2 mb-4">
							<div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
								<TrendingDown className="h-5 w-5 text-white" />
							</div>
							<span className="font-bold text-xl">
								PriceMorph
							</span>
						</div>
						<p className="text-gray-400">
							The smartest way to track prices and save money on
							your favorite products.
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
							<li>
								<Link
									href="/#pricing"
									className="hover:text-white"
								>
									Pricing
								</Link>
							</li>
							<li>
								<Link
									href="/#how-it-works"
									className="hover:text-white"
								>
									How it Works
								</Link>
							</li>
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
	);
};
