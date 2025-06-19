import { loadChat } from '@/lib/chat-store';
import Chat from '@/components/chat';
import { notFound, redirect } from 'next/navigation';
import { getUserByUserId } from '@/services/user';
import { verifyAuthToken } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/constants';

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = params;

    // Check authentication using Firebase token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get(COOKIE_NAME)?.value;

    if (!authToken) {
        // Redirect to login if no token
        notFound()
        redirect('/auth/sign-in');
    }

    let decodedToken;
    try {
        decodedToken = await verifyAuthToken(authToken);
    } catch (error: any) {
        // Check for expired token error
        if (error?.code === 'auth/id-token-expired') {
            redirect('/auth/sign-in');
        }
        console.error('Error verifying auth token:', error);
        notFound();
    }

    if (!decodedToken?.uid) {
        redirect('/auth/sign-in');
    }

    try {
        const messages = await loadChat(id);
        return <Chat id={id} initialMessages={messages} />;
    } catch (error) {
        console.error('Error loading chat:', error);
        notFound();
    }
}