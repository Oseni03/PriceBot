import { NextResponse } from "next/server";
import axios from "axios";
import logger from "@/lib/logger";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3001";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { tool, params } = body;

		if (!tool) {
			return NextResponse.json(
				{ error: "Tool name is required" },
				{ status: 400 }
			);
		}

		const response = await axios.post(
			`${MCP_SERVER_URL}/tools/${tool}`,
			params
		);
		return NextResponse.json(response.data);
	} catch (error: any) {
		logger.error("MCP Server error:", error.message);
		return NextResponse.json(
			{ error: error.message || "Failed to execute MCP tool" },
			{ status: 500 }
		);
	}
}
