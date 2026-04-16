import { useEffect, useState } from "react";

function MyTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Tickets</h2>

      {tickets.map((ticket) => (
        <div key={ticket.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>{ticket.title}</h3>
          <p><b>Category:</b> {ticket.category}</p>
          <p><b>Description:</b> {ticket.description}</p>
          <p><b>Priority:</b> {ticket.priority}</p>
          <p><b>Status:</b> {ticket.status}</p>
          <p><b>Assigned To:</b> {ticket.assignedTo}</p>
        </div>
      ))}
    </div>
  );
}

export default MyTickets;