"use client";

import { cn } from "@/lib/utils";
import { Message } from "@prisma/client";

function formatMarkdown(text: string) {
	return text.split("\n").map((line) => {
		// Handle code blocks
		if (line.startsWith("```")) {
			return line.replace(/```(\w+)?/, "").trim();
		}

		// Handle bold text
		line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

		// Handle italic text
		line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");

		// Handle inline code
		line = line.replace(/`(.*?)`/g, "<code>$1</code>");

		// Handle links
		line = line.replace(
			/\[(.*?)\]\((.*?)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
		);

		return line;
	});
}

export function MessageContent({ message }: { message: Message }) {
	// If it's a user message, display as plain text
	if (message.sender === "USER") {
		return <div className="whitespace-pre-wrap">{message.text}</div>;
	}

	// For bot messages, parse markdown
	const formattedLines = formatMarkdown(message.text);

	return (
		<div className="whitespace-pre-wrap">
			{formattedLines.map((line, i) => (
				<div
					key={i}
					className={cn(
						"min-w-0",
						line.startsWith("<code>") &&
						"font-mono bg-muted/50 px-1.5 py-0.5 rounded",
						!line && "h-4" // Add spacing for empty lines
					)}
					dangerouslySetInnerHTML={{ __html: line }}
				/>
			))}
		</div>
	);
}
