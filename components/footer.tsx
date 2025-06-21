import React from "react";
import { TrendingDown, Mail, Twitter, Linkedin, Github } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		product: [
			{ name: "Features", href: "/#features" },
			{ name: "Pricing", href: "/#pricing" },
			{ name: "How it Works", href: "/#how-it-works" },
			{ name: "Supported Platforms", href: "/about" },
		],
		support: [
			{ name: "Contact Us", href: "/contact" },
			{ name: "Help Center", href: "/contact" },
			{ name: "FAQ", href: "/contact" },
		],
		company: [
			{ name: "About Us", href: "/about" },
			{ name: "Blog", href: "#" },
		],
		legal: [
			{ name: "Privacy Policy", href: "/privacy" },
			{ name: "Terms of Service", href: "/terms" },
		],
	};

	const socialLinks = [
		{ name: "Twitter", href: "#", icon: Twitter },
		{ name: "LinkedIn", href: "#", icon: Linkedin },
		{ name: "GitHub", href: "#", icon: Github },
		{ name: "Email", href: "mailto:support@pricebot.com", icon: Mail },
	];

	return (
		<footer className="py-12 px-4 bg-gray-900 text-white">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
					{/* Brand Section */}
					<div className="lg:col-span-2">
						<div className="flex items-center gap-2 mb-4">
							<div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
								<TrendingDown className="h-5 w-5 text-white" />
							</div>
							<span className="font-bold text-xl">PriceBot</span>
						</div>
						<p className="text-gray-400 mb-4 max-w-md">
							Your intelligent shopping companion that helps you find the best deals
							and track prices across multiple platforms.
						</p>
						<div className="flex space-x-4">
							{socialLinks.map((social) => (
								<a
									key={social.name}
									href={social.href}
									className="text-gray-400 hover:text-white transition-colors"
									aria-label={social.name}
								>
									<social.icon className="h-5 w-5" />
								</a>
							))}
						</div>
					</div>

					{/* Product Links */}
					<div>
						<h4 className="font-semibold mb-4">Product</h4>
						<ul className="space-y-2 text-gray-400">
							{footerLinks.product.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className="hover:text-white transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support Links */}
					<div>
						<h4 className="font-semibold mb-4">Support</h4>
						<ul className="space-y-2 text-gray-400">
							{footerLinks.support.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className="hover:text-white transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company & Legal Links */}
					<div>
						<h4 className="font-semibold mb-4">Company</h4>
						<ul className="space-y-2 text-gray-400">
							{footerLinks.company.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className="hover:text-white transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
						<div className="mt-6">
							<h4 className="font-semibold mb-4">Legal</h4>
							<ul className="space-y-2 text-gray-400">
								{footerLinks.legal.map((link) => (
									<li key={link.name}>
										<Link
											href={link.href}
											className="hover:text-white transition-colors"
										>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
					<p>&copy; {currentYear} PriceBot. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};
