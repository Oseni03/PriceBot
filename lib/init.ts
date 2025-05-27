import { mcpClientService } from "./services/mcpClientService";
import logger from "./logger";

export async function initializeServices() {
	try {
		const serverScript = process.env.MCP_SERVER_SCRIPT;
		if (!serverScript) {
			throw new Error(
				"MCP_SERVER_SCRIPT environment variable is not set"
			);
		}

		await mcpClientService.initialize(serverScript);
		logger.info("MCP Client initialized successfully");
	} catch (error) {
		logger.error("Failed to initialize services:", error);
		throw error;
	}
}
