import { useState } from "react";
import ResourceFilter from "../components/ResourceFilter";
import ResourceForm from "../components/ResourceForm";
import ResourceList from "../components/ResourceList";
import { createResource, updateResource } from "../services/resourceService";

const ResourcesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    location: "",
    minCapacity: "",
  });

  const handleOpenAdd = () => {
    setSelectedResource(null);
    setShowModal(true);
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResource(null);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFilter = (nextFilters) => {
    setFilters(nextFilters);
    setSuccessMessage("");
    triggerRefresh();
  };

  const handleDeleteSuccess = () => {
    setSuccessMessage("Resource deleted successfully.");
    triggerRefresh();
  };

  const saveResource = async (resourceData, resourceToEdit) => {
    if (resourceToEdit?.id) {
      await updateResource(resourceToEdit.id, resourceData);
      setSuccessMessage("Resource updated successfully.");
    } else {
      await createResource(resourceData);
      setSuccessMessage("Resource created successfully.");
    }

    triggerRefresh();
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Resource Management</h2>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          Add New Resource
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      <div className="card mb-3">
        <div className="card-body">
          <ResourceFilter onFilter={handleFilter} />
        </div>
      </div>

      <ResourceList
        filters={filters}
        onEdit={handleEdit}
        onDeleteSuccess={handleDeleteSuccess}
        refreshTrigger={refreshTrigger}
      />

      <ResourceForm
        show={showModal}
        onHide={handleCloseModal}
        onSave={saveResource}
        resource={selectedResource}
      />
    </div>
  );
};

export default ResourcesPage;
