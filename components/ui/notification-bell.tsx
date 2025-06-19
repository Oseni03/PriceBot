"use client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useSWR from 'swr';

const fetcher = (url: string): Promise<any> => fetch(url).then(res => res.json());

export default function NotificationBell() {
    const { data: notifications, error } = useSWR('/api/notifications', fetcher, {
        refreshInterval: 60000 // Refresh every 60 seconds
    });

    const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

    return (
        <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-600 text-xs text-white flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </Button>
        </Link>
    );
} 