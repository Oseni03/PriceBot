"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSWR, { useSWRConfig } from 'swr';
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NotificationsPage() {
    const { data: notifications, error, isLoading } = useSWR('/api/notifications', fetcher);
    const { mutate } = useSWRConfig();

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read', { method: 'POST' });
            mutate('/api/notifications'); // Re-fetch notifications to update the UI
            toast.success("All notifications marked as read.");
        } catch (err) {
            toast.error("Failed to mark notifications as read.");
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Failed to load notifications.</div>;

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Notifications</CardTitle>
                    <Button variant="outline" onClick={markAllAsRead}>
                        Mark all as read
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {notifications && notifications.length > 0 ? (
                            notifications.map((notification: any) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg flex items-start gap-4 ${!notification.read ? "bg-purple-50" : "bg-white"
                                        }`}
                                >
                                    <div className={`mt-1 h-2 w-2 rounded-full ${!notification.read ? "bg-purple-600" : "bg-gray-300"}`} />
                                    <div className="flex-1">
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt))} ago
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">You have no notifications.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 