import { mcpClientService } from "./services/mcpClientService";
import logger from "./logger";

export async function initializeServices() {
	try {
		await mcpClientService.initialize();
		logger.info("MCP Client initialized successfully");
	} catch (error) {
		logger.error("Failed to initialize services:", error);
		throw error;
	}
}
