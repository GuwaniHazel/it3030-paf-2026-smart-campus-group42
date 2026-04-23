const API_BASE_URL = "http://localhost:8080/api/resources";

const operationState = {
  loading: {
    getAllResources: false,
    getResourceById: false,
    createResource: false,
    updateResource: false,
    deleteResource: false,
    getStats: false,
  },
  error: {
    getAllResources: null,
    getResourceById: null,
    createResource: null,
    updateResource: null,
    deleteResource: null,
    getStats: null,
  },
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const updateState = (operation, loading, error = null) => {
  operationState.loading[operation] = loading;
  operationState.error[operation] = error;
};

const parseResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

const request = async (operation, url, options = {}) => {
  updateState(operation, true, null);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    return await parseResponse(response);
  } catch (error) {
    updateState(operation, false, error.message || "Unexpected error");
    throw error;
  } finally {
    updateState(operation, false, operationState.error[operation]);
  }
};

export const resourceService = {
  async getAllResources() {
    return request("getAllResources", API_BASE_URL, { method: "GET" });
  },

  async list() {
    return this.getAllResources();
  },

  async getResourceById(id) {
    return request("getResourceById", `${API_BASE_URL}/${id}`, { method: "GET" });
  },

  async createResource(data) {
    return request("createResource", API_BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async create(data) {
    return this.createResource(data);
  },

  async updateResource(id, data) {
    return request("updateResource", `${API_BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return this.updateResource(id, data);
  },

  async deleteResource(id) {
    return request("deleteResource", `${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
  },

  async remove(id) {
    return this.deleteResource(id);
  },

  async getStats() {
    return request("getStats", `${API_BASE_URL}/stats`, { method: "GET" });
  },

  // Loading and error state accessors for UI usage.
  getLoadingState() {
    return { ...operationState.loading };
  },

  getErrorState() {
    return { ...operationState.error };
  },

  // Backward-compatible alias for older code paths.
  async getResources() {
    return this.getAllResources();
  },
};
