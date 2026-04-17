import { useState } from "react";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import AdminTickets from "./pages/AdminTickets";

function App() {
  const [page, setPage] = useState("create");

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setPage("create")}>Create Ticket</button>
      <button onClick={() => setPage("list")} style={{ marginLeft: "10px" }}>
        My Tickets
      </button>
      <button onClick={() => setPage("admin")} style={{ marginLeft: "10px" }}>
        Admin Tickets
      </button>

      <hr />

      {page === "create" && <CreateTicket onSuccess={() => setPage("list")} />}
      {page === "list" && <MyTickets />}
      {page === "admin" && <AdminTickets />}
    </div>
  );
}

export default App;