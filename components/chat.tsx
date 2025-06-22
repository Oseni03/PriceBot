'use client';

import { Message, useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { MessageContent } from './message-content';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send } from 'lucide-react';

export default function Chat({
    id,
    initialMessages,
}: {
    id?: string;
    initialMessages?: Message[];
} = {}) {
    const { messages, input, handleInputChange, handleSubmit, data, setMessages, experimental_resume, isLoading } = useChat({
        id,
        initialMessages,
        sendExtraMessageFields: true,
        body: { userId: id, messages: initialMessages },
        onError: (error) => {
            console.log(error)
        },
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null)

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

    useAutoResume({
        autoResume: true,
        initialMessages: initialMessages?.map(msg => ({
            ...msg,
            parts: msg.parts || []
        })) || [],
        experimental_resume,
        data,
        setMessages,
    });

    return (
        <div className="flex h-full flex-col">
            <Card className="flex flex-1 flex-col">
                <div className="flex-1 p-4">
                    <ScrollArea ref={scrollRef} className="h-[calc(100vh-200px)]">
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex",
                                        message.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >


                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-lg px-4 py-2",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary text-secondary-foreground [&_code]:text-secondary-foreground"
                                        )}
                                    >
                                        <MessageContent message={message} />
                                    </div>
                                </div>
                            ))}

                        </div >
                    </ScrollArea >
                </div>
                <form onSubmit={handleSubmit} className="border-t p-4">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                            className="flex-1"
                        />
                        <Button
                            size="icon"
                            type="submit"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </Card>
        </div>)
} 