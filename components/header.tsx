"use client";

import React from "react";
import { MessageCircle, User } from "lucide-react";
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

	return (
		<header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
						<MessageCircle className="h-5 w-5 text-white" />
					</div>
					<span className="font-bold text-xl">Morphe AI</span>
				</div>
				<nav className="hidden lg:flex items-center gap-8">
					<Link
						href="/#features"
						className="text-gray-600 hover:text-gray-900"
					>
						Features
					</Link>
					<Link
						href="/#how-it-works"
						className="text-gray-600 hover:text-gray-900"
					>
						How it Works
					</Link>
					<Link
						href="/#pricing"
						className="text-gray-600 hover:text-gray-900"
					>
						Pricing
					</Link>
					<Link
						href="/#testimonials"
						className="text-gray-600 hover:text-gray-900"
					>
						Reviews
					</Link>
				</nav>
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
								<Link href="/dashboard">Dashboard</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/settings">Settings</Link>
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
						<Link
							href={"/dashboard/chat"}
							target="_blank"
							rel="noopener noreferrer"
						>
							<MessageCircle className="h-4 w-4 mr-2" />
							Get Started
						</Link>
					</Button>
				)}
			</div>
		</header>
	);
};
