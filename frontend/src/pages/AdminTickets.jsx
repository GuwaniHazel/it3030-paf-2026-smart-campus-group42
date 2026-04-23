import { useEffect, useState } from "react";

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [assignValues, setAssignValues] = useState({});
  const [statusValues, setStatusValues] = useState({});

  const loadTickets = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const fetchComments = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/comments/${ticketId}`);
      const data = await res.json();

      setComments((prev) => ({
        ...prev,
        [ticketId]: data
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentChange = (ticketId, value) => {
    setNewComments((prev) => ({
      ...prev,
      [ticketId]: value
    }));
  };

  const addComment = async (ticketId) => {
    try {
      const message = newComments[ticketId];

      if (!message || message.trim() === "") {
        alert("Please enter a reply");
        return;
      }

      await fetch("http://localhost:8080/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ticketId: ticketId,
          user: "Admin",
          message: message
        })
      });

      setNewComments((prev) => ({
        ...prev,
        [ticketId]: ""
      }));

      fetchComments(ticketId);
    } catch (err) {
      console.error(err);
      alert("Error adding comment");
    }
  };

  const handleAssignChange = (ticketId, value) => {
    setAssignValues((prev) => ({
      ...prev,
      [ticketId]: value
    }));
  };

  const handleStatusChange = (ticketId, value) => {
    setStatusValues((prev) => ({
      ...prev,
      [ticketId]: value
    }));
  };

  const assignTicket = async (ticketId) => {
    try {
      const assignedTo = assignValues[ticketId];

      if (!assignedTo) {
        alert("Select assignee");
        return;
      }

      await fetch(
        `http://localhost:8080/api/tickets/${ticketId}/assign?assignedTo=${encodeURIComponent(
          assignedTo
        )}`,
        { method: "PATCH" }
      );

      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Error assigning ticket");
    }
  };

  const updateStatus = async (ticketId) => {
    try {
      const status = statusValues[ticketId];

      if (!status) {
        alert("Select status");
        return;
      }

      await fetch(
        `http://localhost:8080/api/tickets/${ticketId}/status?status=${encodeURIComponent(
          status
        )}`,
        { method: "PATCH" }
      );

      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const deleteTicket = async (ticketId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:8080/api/tickets/${ticketId}`, {
        method: "DELETE"
      });

      alert("Ticket deleted successfully");
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Error deleting ticket");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Ticket Management</h2>

      {tickets.map((ticket) => (
        <div key={ticket.id} className="ticket-card">
          <div className="ticket-header">
            <span className="ticket-title">{ticket.title}</span>
            <span className={`ticket-status ${ticket.status}`}>
              {ticket.status}
            </span>
          </div>

          <p><b>Ticket Code:</b> {ticket.ticketCode}</p>
          <p><b>Student Name:</b> {ticket.createdBy}</p>
          <p><b>Student ID:</b> {ticket.studentId}</p>
          <p><b>Email:</b> {ticket.studentEmail}</p>

          <hr />

          <p><b>Category:</b> {ticket.category}</p>
          <p><b>Description:</b> {ticket.description}</p>
          <p><b>Priority:</b> {ticket.priority}</p>
          <p><b>Status:</b> {ticket.status}</p>
          <p><b>Assigned To:</b> {ticket.assignedTo || "Not assigned"}</p>
          <p><b>Location:</b> {ticket.location || "-"}</p>
          <p><b>Resource:</b> {ticket.resourceName || "-"}</p>
          <p>
            <b>Attachment:</b>{" "}
            {ticket.attachment ? (
              <a
                href={`http://localhost:8080/uploads/${ticket.attachment}`}
                target="_blank"
                rel="noreferrer"
              >
                View File
              </a>
            ) : (
              "No attachment"
            )}
          </p>

          <div className="ticket-actions">
            <select
              value={assignValues[ticket.id] || ""}
              onChange={(e) => handleAssignChange(ticket.id, e.target.value)}
            >
              <option value="">Select assignee</option>
              <option value="Admin1">Admin1</option>
              <option value="Technician1">Technician1</option>
              <option value="Technician2">Technician2</option>
            </select>

            <button onClick={() => assignTicket(ticket.id)}>
              Assign
            </button>
          </div>

          <div className="ticket-actions">
            <select
              value={statusValues[ticket.id] || ""}
              onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
            >
              <option value="">Select status</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <button onClick={() => updateStatus(ticket.id)}>
              Update Status
            </button>
          </div>

          <div className="ticket-actions">
            <button onClick={() => fetchComments(ticket.id)}>
              Load Comments
            </button>
          </div>

          {comments[ticket.id] &&
            comments[ticket.id].map((c) => (
              <div key={c.id} className="comment-box">
                💬 <b>{c.user}</b>: {c.message}
              </div>
            ))}

          <div className="ticket-actions">
            <input
              type="text"
              placeholder="Write admin reply..."
              value={newComments[ticket.id] || ""}
              onChange={(e) => handleCommentChange(ticket.id, e.target.value)}
            />
            <button onClick={() => addComment(ticket.id)}>
              Reply
            </button>
          </div>

          <div className="delete-container-left">
            <button
              onClick={() => deleteTicket(ticket.id)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminTickets;