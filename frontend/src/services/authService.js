const API_BASE_URL = "http://localhost:8081/api/auth";

const parseResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return parseResponse(response);
};

const saveAuth = (authResponse) => {
  if (!authResponse) {
    return;
  }

  if (authResponse.token) {
    window.localStorage.setItem("token", authResponse.token);
  }

  if (authResponse.user) {
    window.localStorage.setItem("user", JSON.stringify(authResponse.user));
  }

  if (authResponse.expiresIn !== undefined && authResponse.expiresIn !== null) {
    window.localStorage.setItem("tokenExpiry", String(authResponse.expiresIn));
  }
};

const clearAuth = () => {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("tokenExpiry");
};

export const authService = {
  async login(credentials) {
    const authResponse = await request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    saveAuth(authResponse);
    return authResponse;
  },

  async register(payload) {
    const authResponse = await request("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    saveAuth(authResponse);
    return authResponse;
  },

  async me() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearAuth();
      throw new Error("Not authenticated");
    }

    const authResponse = await parseResponse(response);
    saveAuth(authResponse);
    return authResponse;
  },

  logout() {
    clearAuth();
  },

  getToken() {
    return window.localStorage.getItem("token");
  },

  getUser() {
    const raw = window.localStorage.getItem("user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getRoles() {
    const user = this.getUser();
    return user?.roles || [];
  },

  isLoggedIn() {
    return Boolean(this.getToken());
  },

  saveAuth,
};
