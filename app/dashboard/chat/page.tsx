"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Loader2 } from "lucide-react";
import { MessageContent } from "@/components/message-content";

export default function ChatPage() {
	const [input, setInput] = useState("");
	const { messages, isLoading, sendMessage } = useChat();

	const handleSend = async () => {
		if (!input.trim()) return;
		await sendMessage(input);
		setInput("");
	};

	return (
		<div className="flex h-full flex-col">
			<Card className="flex flex-1 flex-col">
				<div className="flex-1 p-4">
					<ScrollArea className="h-[calc(100vh-200px)]">
						<div className="space-y-4">
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex ${message.sender === "user"
											? "justify-end"
											: "justify-start"
										}`}
								>
									{" "}
									<div
										className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === "user"
												? "bg-primary text-primary-foreground"
												: "bg-secondary text-secondary-foreground [&_code]:text-secondary-foreground"
											}`}
									>
										<MessageContent message={message} />
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</div>
				<div className="border-t p-4">
					<div className="flex gap-2">
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Type your message..."
							onKeyDown={(e) =>
								e.key === "Enter" && !isLoading && handleSend()
							}
							disabled={isLoading}
						/>
						<Button onClick={handleSend} disabled={isLoading}>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Send"
							)}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
