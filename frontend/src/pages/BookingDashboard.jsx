import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function BookingDashboard() {
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const stats = useMemo(() => {
    return {
      total:     bookings.length,
      pending:   bookings.filter((b) => b.status === "PENDING").length,
      approved:  bookings.filter((b) => b.status === "APPROVED").length,
      rejected:  bookings.filter((b) => b.status === "REJECTED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length
    };
  }, [bookings]);

  const chartData = [
    { name: "PENDING",   value: stats.pending },
    { name: "APPROVED",  value: stats.approved },
    { name: "REJECTED",  value: stats.rejected },
    { name: "CANCELLED", value: stats.cancelled }
  ];

  const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#6b7280"];

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Smart Campus – Booking Report", 14, 15);

    doc.setFontSize(10);
    doc.text(`Total Bookings: ${stats.total}`, 14, 22);

    const columns = ["ID", "Resource", "Date", "Time", "Purpose", "Attendees", "Status"];
    const rows = bookings.map((b) => [
      b.id,
      b.resourceId,
      b.date,
      `${b.startTime} – ${b.endTime}`,
      b.purpose,
      b.attendees,
      b.status
    ]);

    autoTable(doc, { head: [columns], body: rows, startY: 30 });

    doc.save("booking-report.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 Booking Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <button style={pdfBtn} onClick={downloadPDF}>
          📄 Download Report
        </button>
      </div>

      <div style={grid}>
        <Card title="Total Bookings" value={stats.total} />
        <Card title="Pending"        value={stats.pending} />
        <Card title="Approved"       value={stats.approved} />
        <Card title="Rejected"       value={stats.rejected} />
        <Card title="Cancelled"      value={stats.cancelled} />
      </div>

      <div style={chartBox}>
        <h3>Booking Status Overview</h3>
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

export default BookingDashboard;
