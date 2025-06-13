"use client";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { createOrUpdateUser } from "@/services/user";
import { COOKIE_NAME, FREE_SIGNUP_CREDITS } from "@/lib/constants";
import { User } from "@prisma/client";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthContextType["user"]>(null);
	const [loading, setLoading] = useState(true);

	const signOut = async () => {
		try {
			await firebaseSignOut(auth);
			// Clear the auth cookie when signing out
			document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				try {
					// Get the ID token with force refresh to ensure it's current
					const token = await firebaseUser.getIdToken(true);

					// Set the auth cookie with the token
					document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24 * 7
						}`; // 7 days

					// First upsert the user to ensure we have a record
					const dbUser = await createOrUpdateUser({
						id: firebaseUser.uid,
						email: firebaseUser.email!,
						username: firebaseUser?.displayName,
						firstName: "",
						languageCode: "",
						createdAt: new Date(),
						updatedAt: new Date(),
						credits: FREE_SIGNUP_CREDITS,
						flutterwaveCustomerId: null
					});

					// Combine Firebase user with Prisma user data
					setUser(dbUser);
				} catch (error) {
					console.error("Error syncing user data:", error);
					setUser(null);
				}
			} else {
				setUser(null);
				// Clear the auth cookie when no user is present
				document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}
