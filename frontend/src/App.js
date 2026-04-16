import { useState } from "react";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";

function App() {
  const [page, setPage] = useState("create");

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setPage("create")}>Create Ticket</button>
      <button onClick={() => setPage("list")} style={{ marginLeft: "10px" }}>
        My Tickets
      </button>

      <hr />

      {page === "create" ? (
        <CreateTicket onSuccess={() => setPage("list")} />
      ) : (
        <MyTickets />
      )}
    </div>
  );
}

export default App;