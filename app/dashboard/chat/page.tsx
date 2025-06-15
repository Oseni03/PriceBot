"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { Loader2, Send } from "lucide-react";
import { MessageContent } from "@/components/message-content";
import { cn } from "@/lib/utils";

export default function ChatPage() {
	const [input, setInput] = useState("");
	const { messages, isLoading, sendMessage } = useChat();
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	// Focus input on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;
		await sendMessage(input);
		setInput("");
		inputRef.current?.focus();
	};

	// Group messages by date
	const groupedMessages = messages.reduce((groups, message) => {
		const date = new Date(message.timestamp).toLocaleDateString();
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(message);
		return groups;
	}, {} as Record<string, typeof messages>);

	return (
		<div className="flex h-full flex-col">
			<Card className="flex flex-1 flex-col">
				<div className="flex-1 p-4">
					<ScrollArea ref={scrollRef} className="h-[calc(100vh-200px)]">
						<div className="space-y-6">
							{Object.entries(groupedMessages).map(([date, msgs]) => (
								<div key={date} className="space-y-4">
									<div className="text-center text-sm text-muted-foreground">
										{date}
									</div>
									{msgs.map((message) => (
										<div
											key={message.id}
											className={cn(
												"flex",
												message.sender === "USER" ? "justify-end" : "justify-start"
											)}
										>
											<div
												className={cn(
													"max-w-[80%] rounded-lg px-4 py-2",
													message.sender === "USER"
														? "bg-primary text-primary-foreground"
														: "bg-secondary text-secondary-foreground [&_code]:text-secondary-foreground"
												)}
											>
												<MessageContent message={message} />
											</div>
										</div>
									))}
								</div>
							))}
							{isLoading && (
								<div className="flex justify-start">
									<div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
										<Loader2 className="h-4 w-4 animate-spin" />
									</div>
								</div>
							)}
						</div>
					</ScrollArea>
				</div>
				<div className="border-t p-4">
					<div className="flex gap-2">
						<Input
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Type your message..."
							onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
							disabled={isLoading}
							className="flex-1"
						/>
						<Button
							onClick={handleSend}
							disabled={isLoading || !input.trim()}
							size="icon"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
