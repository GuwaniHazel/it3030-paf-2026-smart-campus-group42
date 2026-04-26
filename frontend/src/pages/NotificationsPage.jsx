import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheckCircle, FaClock, FaFilter, FaCheck, FaEnvelopeOpenText } from "react-icons/fa";
import { authService } from "../services/authService";
import { notificationService } from "../services/notificationService";

const typeStyles = {
  GENERAL: "bg-sky-100 text-sky-700",
  ALERT: "bg-rose-100 text-rose-700",
  SYSTEM: "bg-amber-100 text-amber-800",
  REMINDER: "bg-emerald-100 text-emerald-700",
};

const getTypeLabel = (type) => {
  switch (type) {
    case "ALERT":
      return "Alert";
    case "SYSTEM":
      return "System";
    case "REMINDER":
      return "Reminder";
    default:
      return "General";
  }
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingPreference, setSavingPreference] = useState(false);

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate("/login");
      return;
    }

    refreshNotifications();
  }, [navigate]);

  const refreshNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const [page, countResponse, preferencesResponse] = await Promise.all([
        notificationService.getNotifications(0, 20),
        notificationService.getUnreadCount(),
        notificationService.getPreferences(),
      ]);

      setNotifications(Array.isArray(page.content) ? page.content : []);
      setUnreadCount(Number(countResponse.count || 0));
      setPreferences(Array.isArray(preferencesResponse) ? preferencesResponse : []);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      refreshNotifications();
    } catch (actionError) {
      setError(actionError.message || "Failed to mark notification as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      refreshNotifications();
    } catch (actionError) {
      setError(actionError.message || "Failed to mark all notifications as read.");
    }
  };

  const handleTogglePreference = async (type) => {
    const currentPreference = preferences.find((preference) => preference.type === type);
    if (!currentPreference) {
      return;
    }

    const nextValue = !currentPreference.enabled;
    setSavingPreference(true);
    setError("");

    try {
      await notificationService.updatePreference(type, nextValue);
      setPreferences((previous) =>
        previous.map((preference) =>
          preference.type === type ? { ...preference, enabled: nextValue } : preference
        )
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update notification preference.");
    } finally {
      setSavingPreference(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-cyan-50/60 py-16 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200">
                <FaBell className="text-[10px]" /> Notifications
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Campus alerts, read receipts, and delivery preferences
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Review your latest updates, manage unread alerts, and fine-tune which notification types you receive from the campus system.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Unread</p>
                <p className="mt-2 text-4xl font-black">{unreadCount}</p>
              </div>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-3xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaCheck /> Mark all as read
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/80">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Notification queue</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Latest notifications for your campus account, sorted by time.</p>
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
                    Loading notifications...
                  </div>
                ) : error ? (
                  <div className="rounded-3xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-900/20 dark:text-rose-200">
                    {error}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
                    <p className="text-lg font-semibold">No notifications yet</p>
                    <p className="mt-2 text-sm">All the campus updates will appear here as they arrive.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-[1.5rem] border p-5 shadow-sm transition ${
                        notification.status === "UNREAD"
                          ? "border-cyan-400/30 bg-cyan-50/70 dark:border-cyan-500/30 dark:bg-cyan-900/20"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/80"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[notification.type] ?? "bg-slate-200 text-slate-800"}`}>
                              {getTypeLabel(notification.type)}
                            </span>
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              {notification.status === "UNREAD" ? "Unread" : "Read"}
                            </span>
                          </div>
                          <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{notification.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{notification.message}</p>
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-2">
                              <FaClock className="text-xs" /> {formatDate(notification.createdAt)}
                            </span>
                            {notification.link ? (
                              <a
                                href={notification.link}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200"
                              >
                                View details
                              </a>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {notification.status === "UNREAD" ? (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                            >
                              <FaCheckCircle /> Mark read
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              <FaEnvelopeOpenText /> Cleared
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500 text-white">
                  <FaFilter />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Notification preferences</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Control which categories of notifications you want to receive.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {preferences.map((preference) => (
                  <button
                    key={preference.type}
                    type="button"
                    onClick={() => handleTogglePreference(preference.type)}
                    disabled={savingPreference}
                    className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{getTypeLabel(preference.type)}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {preference.enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-9 min-w-[5rem] items-center justify-center rounded-full px-3 text-sm font-semibold ${
                        preference.enabled ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {preference.enabled ? "On" : "Off"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
