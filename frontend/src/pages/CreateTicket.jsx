import { useState } from "react";

function CreateTicket({ onSuccess }) {
  const [ticket, setTicket] = useState({
    title: "",
    category: "",
    description: "",
    priority: "",
    preferredContactType: "",
    preferredContact: "",
    studentId: "",
    studentEmail: "",
    createdBy: "",
    location: "",
    resourceName: ""
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTicket({
      ...ticket,
      [name]: value
    });

    setErrors({
      ...errors,
      [name]: ""
    });
  };

  const handleStudentIdChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, "");
    value = value.slice(0, 10);

    setTicket({
      ...ticket,
      studentId: value
    });

    setErrors({
      ...errors,
      studentId: ""
    });
  };

  const handlePreferredContactChange = (e) => {
    let value = e.target.value;

    if (
      ticket.preferredContactType === "Phone" ||
      ticket.preferredContactType === "WhatsApp"
    ) {
      value = value.replace(/\D/g, "");
      value = value.slice(0, 10);
    }

    setTicket({
      ...ticket,
      preferredContact: value
    });

    setErrors({
      ...errors,
      preferredContact: ""
    });
  };

  const handlePreferredContactKeyDown = (e) => {
    if (
      ticket.preferredContactType === "Phone" ||
      ticket.preferredContactType === "WhatsApp"
    ) {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Home",
        "End"
      ];

      if (allowedKeys.includes(e.key)) {
        return;
      }

      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  const handleContactTypeChange = (e) => {
    const value = e.target.value;

    setTicket({
      ...ticket,
      preferredContactType: value,
      preferredContact: ""
    });

    setErrors({
      ...errors,
      preferredContactType: "",
      preferredContact: ""
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg"
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only PDF, PNG, JPG, and JPEG files are allowed.");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!ticket.createdBy.trim()) {
      newErrors.createdBy = "Student name is required";
    }

    if (!ticket.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    } else if (!/^[A-Za-z]{2,3}[0-9]{6,8}$/.test(ticket.studentId)) {
      newErrors.studentId = "Format: IT12345678 (2-3 letters + 6-8 digits)";
    }

    if (!ticket.studentEmail.trim()) {
      newErrors.studentEmail = "Student email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(ticket.studentEmail)) {
      newErrors.studentEmail = "Enter a valid email address";
    }

    if (!ticket.title.trim()) {
      newErrors.title = "Ticket title is required";
    }

    if (!ticket.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!ticket.priority.trim()) {
      newErrors.priority = "Priority is required";
    }

    if (!ticket.description.trim()) {
      newErrors.description = "Description is required";
    } else if (ticket.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!ticket.preferredContactType.trim()) {
      newErrors.preferredContactType = "Preferred contact type is required";
    }

    if (!ticket.preferredContact.trim()) {
      newErrors.preferredContact = "Preferred contact value is required";
    } else if (ticket.preferredContactType === "Email") {
      if (!/^\S+@\S+\.\S+$/.test(ticket.preferredContact)) {
        newErrors.preferredContact = "Enter a valid email address";
      }
    } else if (
      ticket.preferredContactType === "Phone" ||
      ticket.preferredContactType === "WhatsApp"
    ) {
      if (!/^\d{10}$/.test(ticket.preferredContact)) {
        newErrors.preferredContact = "Enter exactly 10 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        title: ticket.title,
        category: ticket.category,
        description: ticket.description,
        priority: ticket.priority,
        preferredContact: `${ticket.preferredContactType}: ${ticket.preferredContact}`,
        studentId: ticket.studentId,
        studentEmail: ticket.studentEmail,
        createdBy: ticket.createdBy,
        location: ticket.location,
        resourceName: ticket.resourceName
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("http://localhost:8081/api/tickets/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      localStorage.setItem("userEmail", ticket.studentEmail);

      alert("Ticket created successfully!");

      setTicket({
        title: "",
        category: "",
        description: "",
        priority: "",
        preferredContactType: "",
        preferredContact: "",
        studentId: "",
        studentEmail: "",
        createdBy: "",
        location: "",
        resourceName: ""
      });

      setFile(null);
      setErrors({});

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      alert("Error creating ticket");
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "24px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>Create Support Ticket</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Submit your issue and track the progress of your request.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px"
          }}
        >
          <div>
            <label>Student Name</label>
            <input
              type="text"
              name="createdBy"
              placeholder=""
              value={ticket.createdBy}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.createdBy && <p style={errorStyle}>{errors.createdBy}</p>}
          </div>

          <div>
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              placeholder="e.g. IT12345678"
              value={ticket.studentId}
              onChange={handleStudentIdChange}
              style={inputStyle}
            />
            {errors.studentId && <p style={errorStyle}>{errors.studentId}</p>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Student Email</label>
            <input
              type="email"
              name="studentEmail"
              placeholder=""
              value={ticket.studentEmail}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.studentEmail && (
              <p style={errorStyle}>{errors.studentEmail}</p>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Ticket Title</label>
            <input
              type="text"
              name="title"
              placeholder=""
              value={ticket.title}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.title && <p style={errorStyle}>{errors.title}</p>}
          </div>

          <div>
            <label>Category</label>
            <select
              name="category"
              value={ticket.category}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select category</option>
              <option value="IT">IT</option>
              <option value="Network">Network</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Electrical">Electrical</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <p style={errorStyle}>{errors.category}</p>}
          </div>

          <div>
            <label>Priority</label>
            <select
              name="priority"
              value={ticket.priority}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select priority</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
            {errors.priority && <p style={errorStyle}>{errors.priority}</p>}
          </div>

          <div>
            <label>Resource Name</label>
            <input
              type="text"
              name="resourceName"
              placeholder="e.g. Lab PC 01 / Projector"
              value={ticket.resourceName}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Lab 3 / Room A201"
              value={ticket.location}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Description</label>
            <textarea
              name="description"
              placeholder=""
              value={ticket.description}
              onChange={handleChange}
              rows="5"
              style={{ ...inputStyle, resize: "vertical" }}
            />
            {errors.description && (
              <p style={errorStyle}>{errors.description}</p>
            )}
          </div>

          <div>
            <label>Preferred Contact Type</label>
            <select
              name="preferredContactType"
              value={ticket.preferredContactType}
              onChange={handleContactTypeChange}
              style={inputStyle}
            >
              <option value="">Select contact type</option>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
            {errors.preferredContactType && (
              <p style={errorStyle}>{errors.preferredContactType}</p>
            )}
          </div>

          <div>
            <label>
              Preferred Contact Value
              {ticket.preferredContactType === "Email" && " (Email Address)"}
              {(ticket.preferredContactType === "Phone" ||
                ticket.preferredContactType === "WhatsApp") &&
                " (10-digit Number)"}
            </label>

            <input
              type="text"
              name="preferredContact"
              placeholder={
                ticket.preferredContactType === "Email"
                  ? "Enter email address"
                  : ticket.preferredContactType === "Phone" ||
                    ticket.preferredContactType === "WhatsApp"
                  ? "Enter 10-digit number"
                  : "Enter preferred contact"
              }
              value={ticket.preferredContact}
              onChange={handlePreferredContactChange}
              onKeyDown={handlePreferredContactKeyDown}
              style={inputStyle}
            />

            {errors.preferredContact && (
              <p style={errorStyle}>{errors.preferredContact}</p>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Attachment (PDF / PNG / JPG)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              style={inputStyle}
            />
            {file && (
              <p style={{ fontSize: "13px", marginTop: "6px" }}>
                Selected file: {file.name}
              </p>
            )}
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <button type="submit" style={buttonStyle}>
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box"
};

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "bold"
};

const errorStyle = {
  color: "red",
  fontSize: "13px",
  marginTop: "5px",
  marginBottom: "0"
};

export default CreateTicket;