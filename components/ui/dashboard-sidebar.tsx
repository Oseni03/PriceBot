"use client";

import { MessageSquare, List, Share2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
	{
		name: "Chat",
		href: "/dashboard/chat",
		icon: MessageSquare,
	},
	{
		name: "Tracklist",
		href: "/dashboard/tracklist",
		icon: List,
	},
	{
		name: "Integrations",
		href: "/dashboard/integrations",
		icon: Share2,
	},
];

export default function DashboardSidebar() {
	const pathname = usePathname();

	return (
		<div className="flex h-full w-64 flex-col border-r bg-sidebar">
			<div className="flex h-16 items-center px-6">
				<div className="flex items-center gap-2">
					<div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
						<MessageCircle className="h-5 w-5 text-white" />
					</div>
					<span className="font-bold text-xl">Morphe AI</span>
				</div>
			</div>
			<nav className="flex-1 space-y-1 px-3 py-4">
				{navigation.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.name}
							href={item.href}
							className={`flex items-center px-3 py-2 font-medium rounded-md transition-colors ${
								isActive
									? "bg-sidebar-accent text-sidebar-accent-foreground"
									: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
							}`}
						>
							<item.icon className="mr-3 h-5 w-5" />
							{item.name}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
