"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Integration {
	platform: string;
	isConnected: boolean;
	username?: string;
}

export default function IntegrationsPage() {
	const [integrations, setIntegrations] = useState<Integration[]>([
		{ platform: "Telegram", isConnected: false },
		{ platform: "WhatsApp", isConnected: false },
	]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchIntegrations = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await fetch("/api/integrations");

				if (!response.ok) {
					throw new Error("Failed to fetch integrations");
				}

				const data = await response.json();
				setIntegrations(data.integrations);
			} catch (error) {
				console.error("Failed to fetch integrations:", error);
				setError(
					"Failed to load integrations. Please try again later."
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchIntegrations();
	}, []);
	const [isConnecting, setIsConnecting] = useState<string | null>(null);

	const handleConnect = async (platform: string) => {
		try {
			setIsConnecting(platform);
			const response = await fetch("/api/integrations/connect", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ platform }),
			});

			if (!response.ok) {
				throw new Error("Failed to initiate connection");
			}

			const data = await response.json();

			// If there's a redirect URL (e.g., for WhatsApp), redirect to it
			if (data.redirectUrl) {
				window.location.href = data.redirectUrl;
			}
		} catch (error) {
			console.error(`Failed to connect to ${platform}:`, error);
			setError(`Failed to connect to ${platform}. Please try again.`);
		} finally {
			setIsConnecting(null);
		}
	};

	const handleDisconnect = async (platform: string) => {
		try {
			setIsConnecting(platform);
			const response = await fetch(
				`/api/integrations/connect?platform=${platform}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to disconnect");
			}

			// Refresh the integrations list
			const updatedResponse = await fetch("/api/integrations");
			if (!updatedResponse.ok) {
				throw new Error("Failed to refresh integrations");
			}

			const data = await updatedResponse.json();
			setIntegrations(data.integrations);
		} catch (error) {
			console.error(`Failed to disconnect from ${platform}:`, error);
			setError(
				`Failed to disconnect from ${platform}. Please try again.`
			);
		} finally {
			setIsConnecting(null);
		}
	};
	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Messaging Platforms</h2>
			{error && (
				<div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
					{error}
				</div>
			)}
			<div className="grid gap-6 md:grid-cols-2">
				{isLoading ? (
					<>
						<Card className="p-6">
							<div className="animate-pulse flex items-center justify-between">
								<div className="space-y-3">
									<div className="h-4 w-24 bg-muted rounded"></div>
									<div className="h-3 w-32 bg-muted rounded"></div>
								</div>
								<div className="h-9 w-24 bg-muted rounded"></div>
							</div>
						</Card>
						<Card className="p-6">
							<div className="animate-pulse flex items-center justify-between">
								<div className="space-y-3">
									<div className="h-4 w-24 bg-muted rounded"></div>
									<div className="h-3 w-32 bg-muted rounded"></div>
								</div>
								<div className="h-9 w-24 bg-muted rounded"></div>
							</div>
						</Card>
					</>
				) : (
					integrations.map((integration) => (
						<Card key={integration.platform} className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<h3 className="text-lg font-medium">
										{integration.platform}
									</h3>
									<div className="flex items-center text-sm">
										{integration.isConnected ? (
											<>
												<CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
												<span className="text-green-500">
													Connected
												</span>
												{integration.username && (
													<span className="ml-2 text-muted-foreground">
														as{" "}
														{integration.username}
													</span>
												)}
											</>
										) : (
											<>
												<AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
												<span className="text-yellow-500">
													Not connected
												</span>
											</>
										)}
									</div>
								</div>{" "}
								<Button
									variant={
										integration.isConnected
											? "destructive"
											: "default"
									}
									onClick={() =>
										integration.isConnected
											? handleDisconnect(
													integration.platform
											  )
											: handleConnect(
													integration.platform
											  )
									}
									disabled={
										isConnecting === integration.platform
									}
								>
									{isConnecting === integration.platform ? (
										<>
											<span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
											{integration.isConnected
												? "Disconnecting..."
												: "Connecting..."}
										</>
									) : (
										<>
											{integration.isConnected
												? "Disconnect"
												: "Connect"}
										</>
									)}
								</Button>
							</div>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
