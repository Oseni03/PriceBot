import { loadChat } from '@/lib/chat-store';
import Chat from '@/components/chat';
import { notFound } from 'next/navigation';
import { getUserByUserId } from '@/services/user';
import { verifyAuthToken } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/constants';

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        // Check authentication using Firebase token from cookies
        const cookieStore = await cookies();
        const authToken = cookieStore.get(COOKIE_NAME)?.value;

        if (!authToken) {
            return notFound();
        }

        const decodedToken = await verifyAuthToken(authToken);
        if (!decodedToken?.uid) {
            return notFound();
        }

        const messages = await loadChat(id);
        return <Chat id={id} initialMessages={messages} />;
    } catch (error) {
        console.error('Error loading chat:', error);
        return notFound();
    }
} 