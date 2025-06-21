"use client";

import React, { useState } from "react";
import { MessageCircle, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

export const Header = () => {
	const { user, signOut } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const navigation = [
		{ name: "Features", href: "/#features" },
		{ name: "How it Works", href: "/#how-it-works" },
		{ name: "Pricing", href: "/#pricing" },
		{ name: "About", href: "/about" },
		{ name: "Contact", href: "/contact" },
	];

	return (
		<header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2">
					<div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
						<MessageCircle className="h-5 w-5 text-white" />
					</div>
					<span className="font-bold text-xl">PriceBot</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden lg:flex items-center gap-8">
					{navigation.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className="text-gray-600 hover:text-gray-900 transition-colors"
						>
							{item.name}
						</Link>
					))}
				</nav>

				{/* Desktop Auth */}
				<div className="hidden lg:flex items-center gap-4">
					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="relative">
									<User className="h-5 w-5" />
									<span className="ml-2">{user.username}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<Link href="/dashboard/chat">Dashboard</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/subscription">Subscription</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-red-600"
									onClick={signOut}
								>
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button variant="outline" asChild>
							<Link href="/auth/sign-in">
								<MessageCircle className="h-4 w-4 mr-2" />
								Get Started
							</Link>
						</Button>
					)}
				</div>

				{/* Mobile menu button */}
				<button
					className="lg:hidden"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				>
					{isMobileMenuOpen ? (
						<X className="h-6 w-6 text-gray-600" />
					) : (
						<Menu className="h-6 w-6 text-gray-600" />
					)}
				</button>
			</div>

			{/* Mobile Navigation */}
			{isMobileMenuOpen && (
				<div className="lg:hidden border-t bg-white">
					<nav className="container mx-auto px-4 py-4">
						<div className="flex flex-col space-y-4">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="text-gray-600 hover:text-gray-900 transition-colors"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{item.name}
								</Link>
							))}
							<div className="pt-4 border-t">
								{user ? (
									<div className="flex flex-col space-y-2">
										<Link href="/dashboard/chat">
											<Button variant="outline" className="w-full">
												Dashboard
											</Button>
										</Link>
										<Button onClick={signOut} variant="ghost" className="w-full">
											Logout
										</Button>
									</div>
								) : (
									<Link href="/auth/sign-in">
										<Button variant="outline" className="w-full">
											<MessageCircle className="h-4 w-4 mr-2" />
											Get Started
										</Button>
									</Link>
								)}
							</div>
						</div>
					</nav>
				</div>
			)}
		</header>
	);
};
