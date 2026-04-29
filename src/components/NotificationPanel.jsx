import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  X,
  Megaphone,
  CircleCheck,
  ClipboardList,
  AlertTriangle,
  Clock,
  Settings,
  CheckCheck,
  Loader2,
  Bell,
  BellOff,
  ArrowRight,
} from "lucide-react";
import {
  useMyNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
} from "../hooks/useNotifications";

const categoryIcons = {
  announcement: Megaphone,
  approval: CircleCheck,
  task: ClipboardList,
  alert: AlertTriangle,
  reminder: Clock,
  system: Settings,
};

const priorityColors = {
  low: {
    border: "border-l-gray-300 dark:border-l-gray-600",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  },
  medium: {
    border: "border-l-blue-400 dark:border-l-blue-500",
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  },
  high: {
    border: "border-l-orange-400 dark:border-l-orange-500",
    badge:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
  },
  critical: {
    border: "border-l-red-500 dark:border-l-red-500",
    badge: "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  },
};

const CATEGORY_FILTERS = [
  { label: "All", value: "" },
  { label: "Approvals", value: "approval" },
  { label: "Tasks", value: "task" },
  { label: "Alerts", value: "alert" },
  { label: "Announcements", value: "announcement" },
  { label: "Reminders", value: "reminder" },
];

const NotificationPanel = ({ open, onClose }) => {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [category, setCategory] = useState("");
  const [readStatus, setReadStatus] = useState("");
  const [localNotifications, setLocalNotifications] = useState([]);
  const [dismissing, setDismissing] = useState(new Set());

  const params = { page: 1, limit: 20 };
  if (category) params.category = category;
  if (readStatus) params.readStatus = readStatus;

  const { data, isLoading, refetch } = useMyNotifications(params);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const dismiss = useDismissNotification();

  // Sync server data to local state
  useEffect(() => {
    if (data?.notifications) {
      setLocalNotifications(data.notifications);
      setDismissing(new Set());
    }
  }, [data]);

  // Fetch when panel opens or filters change
  useEffect(() => {
    if (open) refetch();
  }, [open, category, readStatus, refetch]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleNotificationClick = (notification) => {
    // Optimistic: mark as read in local state
    if (!notification.isRead) {
      setLocalNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n,
        ),
      );
      markAsRead.mutate(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    // Optimistic: animate out then remove
    setDismissing((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setLocalNotifications((prev) => prev.filter((n) => n._id !== id));
      setDismissing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
    dismiss.mutate(id);
  };

  const handleMarkAllRead = () => {
    // Optimistic: mark all as read locally
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllAsRead.mutate();
  };

  const unreadLocalCount = localNotifications.filter((n) => !n.isRead).length;

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      // FIXED: Mobile fluid width (w-[calc(100vw-2rem)]) vs Desktop fixed width (sm:w-[420px])
      className="absolute right-4 sm:right-14 top-18 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[85vh] bg-white dark:bg-layout-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/50 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <Bell className="size-4 dark:text-white text-darkest-blue" />
          <h3 className="text-sm font-semibold dark:text-white text-darkest-blue">
            Notifications
          </h3>
          {unreadLocalCount > 0 && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
              {unreadLocalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button" // FIXED: Added type attribute
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending || unreadLocalCount === 0}
            className={`text-[11px] flex items-center gap-1 font-medium transition-colors ${
              unreadLocalCount > 0
                ? "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </button>
          <button
            type="button" // FIXED: Added type attribute
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="size-4 dark:text-gray-400 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/50 overflow-x-auto no-scrollbar">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button" // FIXED: Added type attribute
            onClick={() => setCategory(f.value)}
            className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
              category === f.value
                ? "bg-darkest-blue dark:bg-blue-600 text-white shadow-sm"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto">
          <button
            type="button" // FIXED: Added type attribute
            onClick={() =>
              setReadStatus(readStatus === "unread" ? "" : "unread")
            }
            className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
              readStatus === "unread"
                ? "bg-darkest-blue dark:bg-blue-600 text-white shadow-sm"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="size-6 animate-spin text-blue-400" />
            <p className="text-xs text-gray-400">Loading notifications...</p>
          </div>
        ) : localNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 mb-3">
              <BellOff className="size-7" />
            </div>
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs mt-1">No notifications to show</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {localNotifications.map((n) => {
              const Icon = categoryIcons[n.category] || AlertTriangle;
              const colors =
                priorityColors[n.priority] || priorityColors.medium;
              const isDismissing = dismissing.has(n._id);

              return (
                <button
                  key={n._id}
                  type="button" // FIXED: Added type attribute
                  onClick={() => handleNotificationClick(n)}
                  // FIXED: Changed from div to button, added w-full and text-left
                  className={`group w-full text-left flex items-start gap-3 px-4 py-3.5 border-l-[3px] ${colors.border} cursor-pointer transition-all duration-300 ${
                    isDismissing
                      ? "opacity-0 -translate-x-8 max-h-0 py-0 overflow-hidden"
                      : "opacity-100 translate-x-0"
                  } ${
                    !n.isRead
                      ? "bg-blue-50/40 dark:bg-blue-950/15 hover:bg-blue-50/70 dark:hover:bg-blue-950/25"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`mt-0.5 p-2 rounded-lg shrink-0 transition-colors ${
                      !n.isRead
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-[13px] leading-snug ${
                          !n.isRead
                            ? "font-semibold dark:text-white text-gray-900"
                            : "font-normal dark:text-gray-300 text-gray-600"
                        }`}
                      >
                        {n.title}
                      </p>
                      <button
                        type="button" // FIXED: Added type attribute
                        onClick={(e) => handleDismiss(e, n._id)}
                        className="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        title="Dismiss"
                      >
                        <X className="size-3.5 text-gray-400" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {n.priority === "high" || n.priority === "critical" ? (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors.badge}`}
                        >
                          {n.priority}
                        </span>
                      ) : null}
                      {n.module && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded capitalize">
                          {n.module}
                        </span>
                      )}
                      {n.actionLabel && (
                        <span className="ml-auto text-[11px] text-blue-500 dark:text-blue-400 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {n.actionLabel}
                          <ArrowRight className="size-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="mt-2.5 shrink-0">
                      <div className="size-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
