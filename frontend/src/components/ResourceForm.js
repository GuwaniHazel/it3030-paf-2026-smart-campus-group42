import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

const createInitialFormData = (resource) => ({
  name: resource?.name || "",
  type: resource?.type || "",
  capacity: resource?.capacity ?? "",
  location: resource?.location || "",
  status: resource?.status || "",
  description: resource?.description || "",
});

const ResourceForm = ({ show, onHide, onSave, resource }) => {
  const [formData, setFormData] = useState(createInitialFormData(resource));
  const [errors, setErrors] = useState({});
  const isEditMode = Boolean(resource?.id);

  useEffect(() => {
    if (show) {
      setFormData(createInitialFormData(resource));
      setErrors({});
    }
  }, [resource, show]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? value : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!formData.type.trim()) {
      nextErrors.type = "Type is required";
    }

    if (!formData.location.trim()) {
      nextErrors.location = "Location is required";
    }

    if (!formData.status) {
      nextErrors.status = "Status is required";
    }

    if (formData.capacity !== "" && Number(formData.capacity) < 0) {
      nextErrors.capacity = "Capacity cannot be negative";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(createInitialFormData(null));
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    if (onHide) {
      onHide();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      ...formData,
      capacity: formData.capacity === "" ? null : Number(formData.capacity),
    };

    try {
      if (onSave) {
        await onSave(payload, resource);
      }
      handleClose();
    } catch (saveError) {
      const message = saveError?.message || "Failed to save resource";
      setErrors((prev) => ({
        ...prev,
        form: message,
      }));
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Edit Resource" : "Add Resource"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errors.form && <div className="alert alert-danger py-2">{errors.form}</div>}

          <Form.Group className="mb-3" controlId="resourceName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={Boolean(errors.name)}
              placeholder="Enter resource name"
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="resourceType">
            <Form.Label>Type</Form.Label>
            <Form.Control
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              isInvalid={Boolean(errors.type)}
              placeholder="Enter resource type"
            />
            <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="resourceCapacity">
            <Form.Label>Capacity</Form.Label>
            <Form.Control
              type="number"
              min="0"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              isInvalid={Boolean(errors.capacity)}
              placeholder="Enter capacity"
            />
            <Form.Control.Feedback type="invalid">{errors.capacity}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="resourceLocation">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              isInvalid={Boolean(errors.location)}
              placeholder="Enter location"
            />
            <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="resourceStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              isInvalid={Boolean(errors.status)}
            >
              <option value="">Select status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.status}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="resourceDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {isEditMode ? "Update" : "Submit"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ResourceForm;
