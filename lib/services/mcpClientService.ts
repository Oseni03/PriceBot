import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import logger from "../logger";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
	throw new Error("OPENAI_API_KEY is not set");
}

class MCPClientService {
	private mcp: Client;
	private llm: OpenAI;
	private transport: StdioClientTransport | null = null;
	public tools: any[] = [];
	private static instance: MCPClientService;

	private constructor() {
		this.llm = new OpenAI({
			apiKey: OPENAI_API_KEY,
		});
		this.mcp = new Client({
			name: "pricebot-mcp-client",
			version: "1.0.0",
		});
	}

	public static getInstance(): MCPClientService {
		if (!MCPClientService.instance) {
			MCPClientService.instance = new MCPClientService();
		}
		return MCPClientService.instance;
	}

	async initialize(serverScriptPath: string) {
		try {
			const isJs = serverScriptPath.endsWith(".js");
			const isPy = serverScriptPath.endsWith(".py");

			if (!isJs && !isPy) {
				throw new Error("Server script must be a .js or .py file");
			}

			const command = isPy
				? process.platform === "win32"
					? "python"
					: "python3"
				: process.execPath;

			this.transport = new StdioClientTransport({
				command,
				args: [serverScriptPath],
			});

			await this.mcp.connect(this.transport);
			const toolsResult = await this.mcp.listTools();

			this.tools = toolsResult.tools.map((tool) => ({
				name: tool.name,
				description: tool.description,
				input_schema: tool.inputSchema,
			}));

			logger.info(
				"MCP Client initialized with tools:",
				this.tools.map((t) => t.name)
			);
		} catch (error) {
			logger.error("Failed to initialize MCP Client:", error);
			throw error;
		}
	}

	async processQuery(query: string) {
		try {
			const messages = [{ role: "user" as const, content: query }];

			const response = await this.llm.chat.completions.create({
				model: "gpt-4-turbo-preview",
				messages,
				tools: this.tools,
				tool_choice: "auto",
			});

			const finalText = [];
			const toolResults = [];

			for (const choice of response.choices) {
				if (choice.message.content) {
					finalText.push(choice.message.content);
				}
				if (choice.message.tool_calls) {
					for (const toolCall of choice.message.tool_calls) {
						const toolName = toolCall.function.name;
						const toolArgs = JSON.parse(
							toolCall.function.arguments
						);

						const result = await this.mcp.callTool({
							name: toolName,
							arguments: toolArgs,
						});

						toolResults.push(result);
						finalText.push(
							`Tool ${toolName} result: ${JSON.stringify(result)}`
						);
					}
				}
			}

			return finalText.join("\n");
		} catch (error) {
			logger.error("Error processing MCP query:", error);
			throw error;
		}
	}

	async cleanup() {
		if (this.transport) {
			await this.mcp.close();
			this.transport = null;
		}
	}
}

export const mcpClientService = MCPClientService.getInstance();
