import { useEffect, useMemo, useState } from "react";
import { deleteResource, getAllResources } from "../services/resourceService";

const ResourceList = ({ filters = {}, onEdit, onDeleteSuccess, refreshTrigger }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const normalizedFilters = useMemo(
    () => ({
      type: (filters?.type || "").trim().toLowerCase(),
      status: (filters?.status || "").trim().toLowerCase(),
      location: (filters?.location || "").trim().toLowerCase(),
      minCapacity:
        filters?.minCapacity !== undefined && filters?.minCapacity !== null && `${filters.minCapacity}`.trim() !== ""
          ? Number(filters.minCapacity)
          : null,
    }),
    [filters]
  );

  const fetchResources = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load resources.");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [refreshTrigger, normalizedFilters]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesType =
        !normalizedFilters.type ||
        (resource.type || "").toLowerCase().includes(normalizedFilters.type);

      const matchesStatus =
        !normalizedFilters.status ||
        (resource.status || "").toLowerCase().includes(normalizedFilters.status);

      const matchesLocation =
        !normalizedFilters.location ||
        (resource.location || "").toLowerCase().includes(normalizedFilters.location);

      const matchesCapacity =
        normalizedFilters.minCapacity === null ||
        (resource.capacity !== null &&
          resource.capacity !== undefined &&
          Number(resource.capacity) >= normalizedFilters.minCapacity);

      return matchesType && matchesStatus && matchesLocation && matchesCapacity;
    });
  }, [resources, normalizedFilters]);

  const handleDelete = async (id) => {
    setError("");
    setDeletingId(id);

    try {
      await deleteResource(id);
      await fetchResources();
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (apiError) {
      setError(apiError.message || "Failed to delete resource.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 my-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" />
        <span>Loading resources...</span>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No resources found.
                </td>
              </tr>
            ) : (
              filteredResources.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.id}</td>
                  <td>{resource.name}</td>
                  <td>{resource.type}</td>
                  <td>{resource.capacity ?? "-"}</td>
                  <td>{resource.location}</td>
                  <td>{resource.status}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit && onEdit(resource)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(resource.id)}
                        disabled={deletingId === resource.id}
                      >
                        {deletingId === resource.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceList;
