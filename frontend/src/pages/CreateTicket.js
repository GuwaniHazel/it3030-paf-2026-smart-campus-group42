import { useState } from "react";

function CreateTicket({ onSuccess }) {
  const [ticket, setTicket] = useState({
    title: "",
    category: "",
    description: "",
    priority: "",
    preferredContact: "",
    resourceName: "",
    location: "",
    createdBy: "",
    studentId: "",
    studentEmail: ""
  });

  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setTicket({
      ...ticket,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: ticket.title,
        category: ticket.category,
        description: ticket.description,
        priority: ticket.priority,
        preferredContact: ticket.preferredContact,
        resourceName: ticket.resourceName,
        location: ticket.location,
        createdBy: ticket.createdBy,
        studentId: ticket.studentId,
        studentEmail: ticket.studentEmail
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

      const data = await response.json();
      setCreatedTicketId(data.id);

      alert("Ticket created successfully!");

      setTicket({
        title: "",
        category: "",
        description: "",
        priority: "",
        preferredContact: "",
        resourceName: "",
        location: "",
        createdBy: "",
        studentId: "",
        studentEmail: ""
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    } catch (error) {
      console.error(error);
      alert("Error creating ticket");
    } finally {
      setLoading(false);
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

      {createdTicketId && (
        <div
          style={{
            background: "#e8f5e9",
            color: "#1b5e20",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "bold"
          }}
        >
          Ticket submitted successfully. Ticket ID: TKT-{createdTicketId}
        </div>
      )}

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
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              placeholder="Enter your student ID"
              value={ticket.studentId}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Student Email</label>
            <input
              type="email"
              name="studentEmail"
              placeholder="Enter your email"
              value={ticket.studentEmail}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Ticket Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter ticket title"
              value={ticket.title}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label>Category</label>
            <select
              name="category"
              value={ticket.category}
              onChange={handleChange}
              required
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
          </div>

          <div>
            <label>Priority</label>
            <select
              name="priority"
              value={ticket.priority}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select priority</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
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
              required
              rows="5"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Preferred Contact</label>
            <input
              type="text"
              name="preferredContact"
              placeholder="Phone / Email / WhatsApp"
              value={ticket.preferredContact}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Submitting..." : "Submit Ticket"}
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

export default CreateTicket;