import { useEffect, useMemo, useState } from "react";

function AdminDashboard() {
  const [tickets, setTickets] = useState([]);

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

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "OPEN").length;
    const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter(t => t.status === "RESOLVED").length;
    const closed = tickets.filter(t => t.status === "CLOSED").length;

    return { total, open, inProgress, resolved, closed };
  }, [tickets]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      <div style={grid}>
        <Card title="Total Tickets" value={stats.total} />
        <Card title="Open" value={stats.open} />
        <Card title="In Progress" value={stats.inProgress} />
        <Card title="Resolved" value={stats.resolved} />
        <Card title="Closed" value={stats.closed} />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={card}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
  marginTop: "20px"
};

const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  textAlign: "center"
};

export default AdminDashboard;