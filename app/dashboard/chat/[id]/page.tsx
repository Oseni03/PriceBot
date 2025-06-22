import { loadChat } from '@/lib/chat-store';
import Chat from '@/components/chat';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const messages = await loadChat(id);
        return <Chat id={id} initialMessages={messages} />;
    } catch (error) {
        console.error('Error loading chat:', error);
        notFound();
    }
}