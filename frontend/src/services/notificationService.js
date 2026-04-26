import { authService } from "./authService";

const API_BASE_URL = "http://localhost:8081/api/notifications";

const parseResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data;
};

const getAuthHeaders = () => {
  const token = authService.getToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const request = async (path = "", options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  return parseResponse(response);
};

export const notificationService = {
  async getNotifications(page = 0, size = 20) {
    return request(`?page=${page}&size=${size}`, { method: "GET" });
  },

  async getUnreadCount() {
    return request("/unread-count", { method: "GET" });
  },

  async markAsRead(id) {
    return request(`/${id}/read`, { method: "PUT" });
  },

  async markAllAsRead() {
    return request("/read-all", { method: "PUT" });
  },

  async getPreferences() {
    return request("/preferences", { method: "GET" });
  },

  async updatePreference(type, enabled) {
    return request("/preferences", {
      method: "PUT",
      body: JSON.stringify({ type, enabled }),
    });
  },
};
