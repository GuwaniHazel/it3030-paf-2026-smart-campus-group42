import { useEffect, useState } from "react";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});

  const userEmail = localStorage.getItem("userEmail");

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
          user: "Student",
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

  const myTickets = tickets.filter(
    (ticket) => ticket.studentEmail === userEmail
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Tickets</h2>

      {!userEmail ? (
        <p>Please create/login with a student email first.</p>
      ) : myTickets.length === 0 ? (
        <p>No tickets found for this student.</p>
      ) : (
        myTickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-header">
              <span className="ticket-title">{ticket.title}</span>
              <span className={`ticket-status ${ticket.status}`}>
                {ticket.status}
              </span>
            </div>

            <p className="ticket-section"><b>Ticket Code:</b> {ticket.ticketCode}</p>
            <p className="ticket-section"><b>Student Name:</b> {ticket.createdBy}</p>
            <p className="ticket-section"><b>Student ID:</b> {ticket.studentId}</p>
            <p className="ticket-section"><b>Email:</b> {ticket.studentEmail}</p>

            <hr />

            <p className="ticket-section"><b>Category:</b> {ticket.category}</p>
            <p className="ticket-section"><b>Description:</b> {ticket.description}</p>
            <p className="ticket-section"><b>Priority:</b> {ticket.priority}</p>
            <p className="ticket-section"><b>Assigned To:</b> {ticket.assignedTo || "Not assigned"}</p>
            <p className="ticket-section"><b>Location:</b> {ticket.location || "-"}</p>
            <p className="ticket-section"><b>Resource:</b> {ticket.resourceName || "-"}</p>

            <div className="ticket-actions">
              <button onClick={() => fetchComments(ticket.id)}>
                View Comments
              </button>
            </div>

            <div style={{ marginTop: "10px" }}>
              {comments[ticket.id] &&
                comments[ticket.id].map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "#f4f4f4",
                      padding: "8px",
                      marginTop: "5px",
                      borderRadius: "5px"
                    }}
                  >
                    💬 <b>{c.user}</b>: {c.message}
                  </div>
                ))}
            </div>

            <div style={{ marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Write your reply..."
                value={newComments[ticket.id] || ""}
                onChange={(e) =>
                  handleCommentChange(ticket.id, e.target.value)
                }
                style={{ padding: "6px", borderRadius: "6px" }}
              />
              <button
                onClick={() => addComment(ticket.id)}
                style={{ marginLeft: "8px" }}
              >
                Send
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyTickets;