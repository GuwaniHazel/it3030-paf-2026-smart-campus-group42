import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function TicketDashboard() {
  const [tickets, setTickets] = useState([]);

  const loadTickets = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // 📊 Stats
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length
    };
  }, [tickets]);

  const chartData = [
    { name: "OPEN", value: stats.open },
    { name: "IN_PROGRESS", value: stats.inProgress },
    { name: "RESOLVED", value: stats.resolved },
    { name: "CLOSED", value: stats.closed }
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#6b7280"];

  // 📄 PDF DOWNLOAD
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Smart Campus Ticket Report", 14, 15);

    doc.setFontSize(10);
    doc.text(`Total Tickets: ${stats.total}`, 14, 22);

    const tableColumn = [
      "Title",
      "Category",
      "Priority",
      "Status",
      "Assigned To"
    ];

    const tableRows = tickets.map((t) => [
      t.title,
      t.category,
      t.priority,
      t.status,
      t.assignedTo || "-"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30
    });

    doc.save("ticket-report.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎫 Ticket Dashboard</h2>

      {/* PDF BUTTON */}
      <div style={{ marginBottom: "20px" }}>
        <button style={pdfBtn} onClick={downloadPDF}>
          📄 Download Report
        </button>
      </div>

      {/* CARDS */}
      <div style={grid}>
        <Card title="Total Tickets" value={stats.total} />
        <Card title="Open" value={stats.open} />
        <Card title="In Progress" value={stats.inProgress} />
        <Card title="Resolved" value={stats.resolved} />
        <Card title="Closed" value={stats.closed} />
      </div>

      {/* CHART */}
      <div style={chartBox}>
        <h3>Ticket Status Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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

/* STYLES */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
  marginTop: "20px"
};

const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  textAlign: "center"
};

const chartBox = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginTop: "20px"
};

const pdfBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

export default TicketDashboard;