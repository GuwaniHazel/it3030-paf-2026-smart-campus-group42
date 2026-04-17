import { useEffect, useState } from "react";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});

  useEffect(() => {
    fetch("http://localhost:8080/api/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .catch((err) => console.error(err));
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Tickets</h2>

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          style={{
            border: "1px solid gray",
            margin: "10px",
            padding: "10px",
            borderRadius: "8px"
          }}
        >
          <h3>{ticket.title}</h3>
          <p><b>Category:</b> {ticket.category}</p>
          <p><b>Description:</b> {ticket.description}</p>
          <p><b>Priority:</b> {ticket.priority}</p>
          <p><b>Status:</b> {ticket.status}</p>
          <p><b>Assigned To:</b> {ticket.assignedTo}</p>

          <button onClick={() => fetchComments(ticket.id)}>Load Comments</button>

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
              placeholder="Write a reply..."
              value={newComments[ticket.id] || ""}
              onChange={(e) => handleCommentChange(ticket.id, e.target.value)}
            />
            <button
              onClick={() => addComment(ticket.id)}
              style={{ marginLeft: "8px" }}
            >
              Add Reply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyTickets;