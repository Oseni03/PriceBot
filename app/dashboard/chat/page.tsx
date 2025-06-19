"use client"

import { redirect } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default async function Page() {
	const { user } = useAuth()
	redirect(`/dashboard/chat/${user?.id}`);
}
