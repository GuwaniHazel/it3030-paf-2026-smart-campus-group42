import { useState } from "react";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import AdminTickets from "./pages/AdminTickets";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setPage("dashboard")}>Dashboard</button>

      <button onClick={() => setPage("create")} style={{ marginLeft: "10px" }}>
        Create Ticket
      </button>

      <button onClick={() => setPage("list")} style={{ marginLeft: "10px" }}>
        My Tickets
      </button>

      <button onClick={() => setPage("admin")} style={{ marginLeft: "10px" }}>
        Admin Tickets
      </button>

      <hr />

      {page === "dashboard" && <AdminDashboard />}
      {page === "create" && <CreateTicket onSuccess={() => setPage("list")} />}
      {page === "list" && <MyTickets />}
      {page === "admin" && <AdminTickets />}
    </div>
  );
}

export default App;