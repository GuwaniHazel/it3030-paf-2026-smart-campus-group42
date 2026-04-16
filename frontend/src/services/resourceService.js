import axios from "axios";

const resourceApi = axios.create({
  baseURL: "http://localhost:8080/api/resources",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllResources = async () => {
  try {
    const response = await resourceApi.get("/");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch resources");
  }
};

export const getResourceById = async (id) => {
  try {
    const response = await resourceApi.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Failed to fetch resource with id ${id}`);
  }
};

export const createResource = async (resource) => {
  try {
    const response = await resourceApi.post("/", resource);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to create resource");
  }
};

export const updateResource = async (id, resource) => {
  try {
    const response = await resourceApi.put(`/${id}`, resource);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Failed to update resource with id ${id}`);
  }
};

export const deleteResource = async (id) => {
  try {
    const response = await resourceApi.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Failed to delete resource with id ${id}`);
  }
};

export const searchResources = async (filters = {}) => {
  try {
    const params = {};

    if (hasValue(filters.type)) {
      params.type = filters.type;
    }
    if (hasValue(filters.status)) {
      params.status = filters.status;
    }
    if (hasValue(filters.location)) {
      params.location = filters.location;
    }
    if (filters.minCapacity !== undefined && filters.minCapacity !== null && filters.minCapacity !== "") {
      params.minCapacity = filters.minCapacity;
    }

    const response = await resourceApi.get("/", { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to search resources");
  }
};

const hasValue = (value) => value !== undefined && value !== null && `${value}`.trim() !== "";

const handleApiError = (error, fallbackMessage) => {
  const serverMessage = error?.response?.data?.message;
  const message = serverMessage || error?.message || fallbackMessage;
  return new Error(message);
};

export default {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  searchResources,
};
