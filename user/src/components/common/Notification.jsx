
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { userContext } from "../../context/UserContext";

import {
  IoMdClose,
  IoMdNotificationsOutline,
} from "react-icons/io";

import {
  FaBell,
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaCheckDouble,
  FaRedo,
  FaTrash,
} from "react-icons/fa";

const Notification = ({
  notificationOpen,
  setNotificationOpen,
}) => {
  const { backendUrl, token } = useContext(userContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // API configuration
  const getApiConfig = useCallback(() => {
    const baseUrl =
      typeof backendUrl === "string"
        ? backendUrl.trim().replace(/\/+$/, "")
        : "";

    if (!baseUrl) {
      throw new Error("Backend URL is not configured.");
    }

    if (!token) {
      throw new Error("Please log in to view notifications.");
    }

    return {
      baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [backendUrl, token]);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (signal) => {
      if (!notificationOpen) return;

      try {
        setLoading(true);
        setError("");

        const { baseUrl, headers } = getApiConfig();

        const { data } = await axios.get(
          `${baseUrl}/api/notifications`,
          {
            headers,
            signal,
          }
        );

        if (!data?.success) {
          throw new Error(
            data?.message || "Failed to fetch notifications."
          );
        }

        setNotifications(
          Array.isArray(data.notifications)
            ? data.notifications
            : []
        );
      } catch (err) {
        if (
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }

        console.error("Fetch Notifications Error:", err);

        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load notifications.";

        setError(message);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [notificationOpen, getApiConfig]
  );

  useEffect(() => {
    if (!notificationOpen) return;

    const controller = new AbortController();

    fetchNotifications(controller.signal);

    return () => controller.abort();
  }, [notificationOpen, fetchNotifications]);

  // Mark one notification as read
  const markAsRead = async (notificationId) => {
    if (!notificationId || actionLoading) return;

    setActionLoading(notificationId);

    try {
      const { baseUrl, headers } = getApiConfig();

      const { data } = await axios.put(
        `${baseUrl}/api/notifications/${encodeURIComponent(
          notificationId
        )}/read`,
        {},
        { headers }
      );

      if (!data?.success) {
        throw new Error(
          data?.message || "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      toast.success("Notification marked as read.");
    } catch (err) {
      console.error("Mark Notification Read Error:", err);

      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to update notification."
      );
    } finally {
      setActionLoading("");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (actionLoading) return;

    const hasUnread = notifications.some(
      (notification) => !notification.isRead
    );

    if (!hasUnread) {
      toast.info("All notifications are already read.");
      return;
    }

    setActionLoading("read-all");

    try {
      const { baseUrl, headers } = getApiConfig();

      const { data } = await axios.put(
        `${baseUrl}/api/notifications/read-all`,
        {},
        { headers }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
          "Failed to mark all notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      toast.success("All notifications marked as read.");
    } catch (err) {
      console.error("Mark All Notifications Error:", err);

      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to update notifications."
      );
    } finally {
      setActionLoading("");
    }
  };

  // Delete one notification
  const deleteNotification = async (notificationId) => {
    if (!notificationId || actionLoading) return;

    setActionLoading(notificationId);

    try {
      const { baseUrl, headers } = getApiConfig();

      const { data } = await axios.delete(
        `${baseUrl}/api/notifications/${encodeURIComponent(
          notificationId
        )}`,
        { headers }
      );

      if (!data?.success) {
        throw new Error(
          data?.message || "Failed to delete notification."
        );
      }

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification._id !== notificationId
        )
      );

      toast.success("Notification deleted.");
    } catch (err) {
      console.error("Delete Notification Error:", err);

      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete notification."
      );
    } finally {
      setActionLoading("");
    }
  };

  // Delete all notifications
  const clearAllNotifications = async () => {
    if (actionLoading) return;

    if (notifications.length === 0) {
      toast.info("There are no notifications to delete.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete all notifications?"
    );

    if (!confirmed) return;

    setActionLoading("clear-all");

    try {
      const { baseUrl, headers } = getApiConfig();

      const { data } = await axios.delete(
        `${baseUrl}/api/notifications/clear-all`,
        { headers }
      );

      if (!data?.success) {
        throw new Error(
          data?.message || "Failed to clear notifications."
        );
      }

      setNotifications([]);
      toast.success("All notifications deleted.");
    } catch (err) {
      console.error("Clear Notifications Error:", err);

      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete notifications."
      );
    } finally {
      setActionLoading("");
    }
  };

  // Notification icon
  const getNotificationIcon = (notification) => {
    const type = String(
      notification.type || notification.category || ""
    ).toLowerCase();

    if (
      type.includes("application") ||
      type.includes("shortlist") ||
      type.includes("status")
    ) {
      return <FaCheckCircle className="text-blue-600" />;
    }

    if (
      type.includes("interview") ||
      type.includes("schedule")
    ) {
      return <FaCalendarAlt className="text-purple-600" />;
    }

    if (
      type.includes("job") ||
      type.includes("company")
    ) {
      return <FaBriefcase className="text-green-600" />;
    }

    return <FaBell className="text-green-600" />;
  };

  const getIconBackground = (notification) => {
    const type = String(
      notification.type || notification.category || ""
    ).toLowerCase();

    if (
      type.includes("application") ||
      type.includes("shortlist") ||
      type.includes("status")
    ) {
      return "bg-blue-100";
    }

    if (
      type.includes("interview") ||
      type.includes("schedule")
    ) {
      return "bg-purple-100";
    }

    if (
      type.includes("job") ||
      type.includes("company")
    ) {
      return "bg-green-100";
    }

    return "bg-gray-100";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const isBusy = actionLoading !== "";

  return (
    <>
      {/* Overlay */}
      {notificationOpen && (
        <button
          type="button"
          aria-label="Close notification panel"
          onClick={() => setNotificationOpen(false)}
          className="fixed inset-0 z-50 cursor-default bg-gray-900/30"
        />
      )}

      {/* Notification panel */}
      <aside
        role="dialog"
        aria-modal={notificationOpen ? "true" : undefined}
        aria-label="Notifications"
        aria-hidden={!notificationOpen}
        className={`fixed right-0 top-0 z-[100] flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${notificationOpen
            ? "translate-x-0"
            : "pointer-events-none translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <IoMdNotificationsOutline className="text-3xl text-green-600" />

              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Notifications
              </h2>

              <p className="text-xs text-gray-500">
                {unreadCount} unread
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNotificationOpen(false)}
            aria-label="Close notifications"
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          >
            <IoMdClose className="text-2xl" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={() => fetchNotifications()}
            disabled={loading || isBusy}
            className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-40"
          >
            <FaRedo className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || isBusy}
            className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-40"
          >
            <FaCheckDouble />
            Mark all as read
          </button>

          <button
            type="button"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0 || isBusy}
            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-40"
          >
            <FaTrash />
            Clear all
          </button>
        </div>

        {/* Notifications list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-500" />

              <p className="mt-4 text-sm text-gray-500">
                Loading notifications...
              </p>
            </div>
          ) : error ? (
            <div className="px-5 py-12 text-center">
              <IoMdNotificationsOutline className="mx-auto text-5xl text-gray-300" />

              <p className="mt-4 break-words text-sm text-red-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchNotifications()}
                className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <IoMdNotificationsOutline className="text-6xl text-gray-300" />

              <h3 className="mt-4 text-lg font-semibold text-gray-700">
                No notifications yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your new notifications will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const notificationId = notification._id;
              const isRead = Boolean(notification.isRead);
              const isItemBusy =
                actionLoading === notificationId;

              return (
                <article
                  key={notificationId}
                  className={`flex gap-3 border-b border-gray-100 px-5 py-4 transition hover:bg-green-50 ${isRead ? "bg-white" : "bg-green-50/70"
                    }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getIconBackground(
                      notification
                    )}`}
                  >
                    {getNotificationIcon(notification)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="break-words font-semibold text-gray-800">
                        {notification.title || "Notification"}
                      </h3>

                      {!isRead && (
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500"
                          title="Unread"
                        />
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-gray-500">
                      {notification.message ||
                        notification.body ||
                        "You have a new notification."}
                    </p>

                    <span className="mt-2 block text-xs text-gray-400">
                      {formatDate(notification.createdAt)}
                    </span>

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notificationId)}
                          disabled={isBusy}
                          className="text-xs font-semibold text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          {isItemBusy ? "Updating..." : "Mark as read"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteNotification(notificationId)
                        }
                        disabled={isBusy}
                        aria-label={`Delete ${notification.title || "notification"
                          }`}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <FaTrash className="text-[10px]" />
                        {isItemBusy ? "Processing..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        {!loading && !error && notifications.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-3 text-center">
            <p className="text-xs text-gray-400">
              Showing {notifications.length} notifications
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Notification;
