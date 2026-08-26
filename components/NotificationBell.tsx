"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { getNotificationsForDoctor, markNotificationRead } from "@/lib/actions/notification.actions";
import { cn } from "@/lib/utils";

const NotificationBell = ({ doctorId }: { doctorId: string }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const data = await getNotificationsForDoctor(doctorId);
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [doctorId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = async () => {
    setIsOpen((v) => !v);
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length > 0) {
      await Promise.all(unread.map((n) => markNotificationRead(n.$id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center size-9 rounded-full hover:bg-dark-300 transition-colors"
      >
        <Bell className="size-5 text-dark-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full bg-red-500 text-white text-[10px] font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-xl border border-dark-500 bg-dark-400 shadow-lg z-50">
          <div className="p-3 border-b border-dark-500">
            <p className="text-14-semibold text-white">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p className="text-14-regular text-dark-700 p-4 text-center">
              No notifications yet.
            </p>
          ) : (
            <div>
              {notifications.map((n) => (
                <div
                  key={n.$id}
                  className="flex items-start gap-3 p-3 border-b border-dark-500 last:border-b-0"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center size-7 rounded-full shrink-0 mt-0.5",
                      n.type === "approved" ? "bg-green-500/10" : "bg-red-500/10"
                    )}
                  >
                    {n.type === "approved" ? (
                      <Check className="size-3.5 text-green-500" />
                    ) : (
                      <X className="size-3.5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-13-regular text-white">{n.message}</p>
                    <p className="text-12-regular text-dark-700 mt-0.5">
                      {timeAgo(n.$createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
