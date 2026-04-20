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

  const validateForm = () => {
    const newErrors = {};

    if (!ticket.createdBy.trim()) {
      newErrors.createdBy = "Student name is required";
    }

    if (!ticket.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
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

      const response = await fetch("http://localhost:8080/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
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
              placeholder="Enter your name"
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
              placeholder="Enter your student ID"
              value={ticket.studentId}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.studentId && <p style={errorStyle}>{errors.studentId}</p>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Student Email</label>
            <input
              type="email"
              name="studentEmail"
              placeholder="Enter your email"
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
              placeholder="Enter ticket title"
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
              placeholder="Describe your issue clearly..."
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