import { useEffect, useState } from "react";

const STATUS_STYLES = {
  OPEN:        "bg-blue-100 text-blue-700 border border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border border-amber-200",
  RESOLVED:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CLOSED:      "bg-slate-100 text-slate-600 border border-slate-200",
};

const PRIORITY_STYLES = {
  LOW:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border border-amber-200",
  HIGH:   "bg-rose-50 text-rose-700 border border-rose-200",
  URGENT: "bg-purple-100 text-purple-700 border border-purple-200",
};

const PRIORITY_DOT = {
  LOW:    "bg-emerald-400",
  MEDIUM: "bg-amber-400",
  HIGH:   "bg-rose-500",
  URGENT: "bg-purple-600",
};

function AdminTickets() {
  const [tickets, setTickets]           = useState([]);
  const [comments, setComments]         = useState({});
  const [newComments, setNewComments]   = useState({});
  const [assignValues, setAssignValues] = useState({});
  const [statusValues, setStatusValues] = useState({});
  const [loading, setLoading]           = useState(true);
  const [openComments, setOpenComments] = useState({});

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:8081/api/tickets");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTickets(); }, []);

  const toggleComments = async (ticketId) => {
    setOpenComments(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
    if (!comments[ticketId]) {
      try {
        const res  = await fetch(`http://localhost:8081/api/comments/${ticketId}`);
        const data = await res.json();
        setComments(prev => ({ ...prev, [ticketId]: data }));
      } catch (err) { console.error(err); }
    }
  };

  const addComment = async (ticketId) => {
    const message = newComments[ticketId];
    if (!message?.trim()) return;
    try {
      await fetch("http://localhost:8081/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, user: "Admin", message }),
      });
      setNewComments(prev => ({ ...prev, [ticketId]: "" }));
      const res  = await fetch(`http://localhost:8081/api/comments/${ticketId}`);
      const data = await res.json();
      setComments(prev => ({ ...prev, [ticketId]: data }));
    } catch (err) { console.error(err); }
  };

  const assignTicket = async (ticketId) => {
    const assignedTo = assignValues[ticketId];
    if (!assignedTo) return;
    try {
      await fetch(`http://localhost:8081/api/tickets/${ticketId}/assign?assignedTo=${encodeURIComponent(assignedTo)}`, { method: "PATCH" });
      loadTickets();
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (ticketId) => {
    const status = statusValues[ticketId];
    if (!status) return;
    try {
      await fetch(`http://localhost:8081/api/tickets/${ticketId}/status?status=${encodeURIComponent(status)}`, { method: "PATCH" });
      loadTickets();
    } catch (err) { console.error(err); }
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm("Delete this ticket permanently?")) return;
    try {
      await fetch(`http://localhost:8081/api/tickets/${ticketId}`, { method: "DELETE" });
      loadTickets();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-200">🎫</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ticket Management</h1>
            <p className="text-sm text-slate-500">Admin · {tickets.length} total tickets</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-500 font-medium">No tickets submitted yet.</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-2">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

            {/* Card top accent bar */}
            <div className={`h-1 w-full ${PRIORITY_DOT[ticket.priority] || "bg-slate-300"}`} />

            <div className="p-5">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base leading-snug truncate">{ticket.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{ticket.ticketCode}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[ticket.priority] || "bg-slate-100 text-slate-600"}`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[ticket.status] || "bg-slate-100 text-slate-600"}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              {/* Student info grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4 bg-slate-50 rounded-xl p-3">
                <InfoRow icon="👤" label="Student" value={ticket.createdBy} />
                <InfoRow icon="🪪" label="ID" value={ticket.studentId} />
                <InfoRow icon="📧" label="Email" value={ticket.studentEmail} className="col-span-2" />
              </div>

              {/* Ticket details */}
              <div className="space-y-1.5 text-sm text-slate-700 mb-4">
                <InfoRow icon="📂" label="Category" value={ticket.category} />
                <InfoRow icon="📍" label="Location" value={ticket.location || "—"} />
                <InfoRow icon="🖥️" label="Resource" value={ticket.resourceName || "—"} />
                <InfoRow icon="👷" label="Assigned To" value={ticket.assignedTo || "Not assigned"} />
                <div className="bg-slate-50 rounded-xl p-3 mt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{ticket.description}</p>
                </div>
                {ticket.attachment && (
                  <a href={`http://localhost:8081/uploads/${ticket.attachment}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors mt-1">
                    📎 View Attachment
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                {/* Assign row */}
                <div className="flex gap-2">
                  <select
                    value={assignValues[ticket.id] || ""}
                    onChange={(e) => setAssignValues(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">Select assignee</option>
                    <option value="Admin1">Admin1</option>
                    <option value="Technician1">Technician1</option>
                    <option value="Technician2">Technician2</option>
                  </select>
                  <button onClick={() => assignTicket(ticket.id)}
                    className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                    Assign
                  </button>
                </div>

                {/* Status row */}
                <div className="flex gap-2">
                  <select
                    value={statusValues[ticket.id] || ""}
                    onChange={(e) => setStatusValues(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">Update status</option>
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <button onClick={() => updateStatus(ticket.id)}
                    className="px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors">
                    Update
                  </button>
                </div>

                {/* Comments toggle */}
                <button onClick={() => toggleComments(ticket.id)}
                  className="w-full text-sm font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                  💬 {openComments[ticket.id] ? "Hide" : "Show"} Comments
                  {comments[ticket.id]?.length > 0 && (
                    <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{comments[ticket.id].length}</span>
                  )}
                </button>

                {/* Comment thread */}
                {openComments[ticket.id] && (
                  <div className="space-y-2">
                    {(comments[ticket.id] || []).map((c) => (
                      <div key={c.id} className={`flex gap-2 ${c.user === "Admin" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.user === "Admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                          {c.user[0]}
                        </div>
                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${c.user === "Admin" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"}`}>
                          <p className="text-xs font-semibold opacity-70 mb-0.5">{c.user}</p>
                          {c.message}
                        </div>
                      </div>
                    ))}
                    {/* Reply input */}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Write admin reply…"
                        value={newComments[ticket.id] || ""}
                        onChange={(e) => setNewComments(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addComment(ticket.id)}
                        className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                      <button onClick={() => addComment(ticket.id)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-semibold">
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete */}
                <button onClick={() => deleteTicket(ticket.id)}
                  className="w-full text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-2 rounded-lg transition-colors">
                  🗑️ Delete Ticket
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, className = "" }) {
  return (
    <div className={`flex items-start gap-1.5 ${className}`}>
      <span className="text-sm">{icon}</span>
      <span className="text-slate-500 font-medium min-w-0">{label}:</span>
      <span className="text-slate-800 font-semibold truncate">{value}</span>
    </div>
  );
}

export default AdminTickets;