import { useState } from "react";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import AdminTickets from "./pages/AdminTickets";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div>
      <div className="top-nav">
        <h2 className="logo">Smart Campus Ticket System</h2>

        <div className="nav-buttons">
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("create")}>Create Ticket</button>
          <button onClick={() => setPage("list")}>My Tickets</button>
          <button onClick={() => setPage("admin")}>Admin Tickets</button>
        </div>
      </div>

      <div className="page-container">
        {page === "dashboard" && <AdminDashboard />}
        {page === "create" && <CreateTicket onSuccess={() => setPage("list")} />}
        {page === "list" && <MyTickets />}
        {page === "admin" && <AdminTickets />}
      </div>
    </div>
  );
}

export default App;