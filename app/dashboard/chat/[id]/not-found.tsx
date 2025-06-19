import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700">Chat Not Found</h2>
                <p className="text-gray-500 max-w-md">
                    This chat doesn't exist or you don't have permission to access it.
                    Please make sure you're logged in and trying to access your own chat.
                </p>
            </div>

            <div className="flex space-x-4">
                <Button asChild>
                    <Link href="/dashboard/chat">
                        Start New Chat
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/dashboard">
                        Go to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
} 