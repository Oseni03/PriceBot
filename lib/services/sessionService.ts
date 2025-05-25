import Cookies from "js-cookie";
import logger from "../logger";

interface SessionData {
	pendingTargetUrl?: string;
	lastUpdated: number;
}

const COOKIE_NAME = "bot_sessions";
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

export class SessionService {
	private sessions: Map<string, SessionData>;

	constructor() {
		this.sessions = new Map();
		this.loadFromCookie();
	}

	private loadFromCookie() {
		try {
			const data = Cookies.get(COOKIE_NAME);
			if (data) {
				const parsed = JSON.parse(data);
				this.sessions = new Map(Object.entries(parsed));
			}
		} catch (error) {
			logger.error("Failed to load sessions from cookie:", error);
			this.sessions = new Map();
		}
	}

	private persist() {
		const data = Object.fromEntries(this.sessions);
		Cookies.set(COOKIE_NAME, JSON.stringify(data), {
			expires: COOKIE_MAX_AGE / (24 * 60 * 60), // Convert seconds to days
			sameSite: "strict",
		});
	}

	getSession(userId: string): SessionData | undefined {
		return this.sessions.get(userId);
	}

	setSession(userId: string, data: Partial<SessionData>): void {
		const existing = this.sessions.get(userId) || {
			lastUpdated: Date.now(),
		};
		this.sessions.set(userId, {
			...existing,
			...data,
			lastUpdated: Date.now(),
		});
		this.persist();
	}

	clearSession(userId: string): void {
		this.sessions.delete(userId);
		this.persist();
	}

	cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
		const now = Date.now();
		let changed = false;
		for (const [userId, session] of this.sessions.entries()) {
			if (now - session.lastUpdated > maxAge) {
				this.sessions.delete(userId);
				changed = true;
			}
		}
		if (changed) {
			this.persist();
		}
	}
}

export const sessionService = new SessionService();
