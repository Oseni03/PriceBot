"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
	id: string;
	email?: string;
	name?: string;
}

interface SessionData {
	pendingTargetUrl?: string;
}

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	isAuthenticated: boolean;
	sessions: Map<string, SessionData>;
	getSession: (userId: string) => SessionData;
	setSession: (userId: string, data: SessionData) => void;
	clearSession: (userId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [sessions] = useState<Map<string, SessionData>>(new Map());

	const value = {
		user,
		setUser,
		isAuthenticated: !!user,
		sessions,
		getSession: (userId: string) => sessions.get(userId) || {},
		setSession: (userId: string, data: SessionData) =>
			sessions.set(userId, data),
		clearSession: (userId: string) => sessions.delete(userId),
	};

	return (
		<UserContext.Provider value={value}>{children}</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
