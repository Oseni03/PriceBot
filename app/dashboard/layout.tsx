"use client";

import { ReactNode, useState, useMemo } from "react";
import DashboardSidebar from "@/components/ui/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const pathname = usePathname();

	const breadcrumbs = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		return segments.map(
			(segment) => segment.charAt(0).toUpperCase() + segment.slice(1)
		);
	}, [pathname]);

	return (
		<div className="flex h-screen bg-white">
			<div
				className={`${
					isSidebarOpen ? "block" : "hidden"
				} border-r bg-white/80 backdrop-blur-sm`}
			>
				<DashboardSidebar />
			</div>
			<div className="flex-1 flex flex-col">
				<header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 flex items-center px-6">
					<Button
						variant="ghost"
						size="icon"
						className="mr-4"
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					>
						<Menu className="h-5 w-5" />
						<span className="sr-only">Toggle sidebar</span>
					</Button>

					{/* Breadcrumbs */}
					<div className="flex items-center text-sm text-gray-600">
						{breadcrumbs.map((segment, index) => (
							<div key={segment} className="flex items-center">
								{index > 0 && (
									<ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
								)}
								<span
									className={
										index === breadcrumbs.length - 1
											? "font-medium text-gray-900"
											: ""
									}
								>
									{segment}
								</span>
							</div>
						))}
					</div>
				</header>
				<main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-purple-50 to-white">
					<div className="mx-auto max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	);
}
