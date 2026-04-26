import { useEffect, useState } from "react";

const STATUS_STYLES = {
  OPEN:        "bg-blue-100 text-blue-700 border border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border border-amber-200",
  RESOLVED:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CLOSED:      "bg-slate-100 text-slate-600 border border-slate-200",
};

const PRIORITY_DOT = {
  LOW:    "bg-emerald-400",
  MEDIUM: "bg-amber-400",
  HIGH:   "bg-rose-500",
  URGENT: "bg-purple-600",
};

const PRIORITY_STYLES = {
  LOW:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border border-amber-200",
  HIGH:   "bg-rose-50 text-rose-700 border border-rose-200",
  URGENT: "bg-purple-100 text-purple-700 border border-purple-200",
};

function MyTickets() {
  const [tickets, setTickets]           = useState([]);
  const [comments, setComments]         = useState({});
  const [newComments, setNewComments]   = useState({});
  const [loading, setLoading]           = useState(true);
  const [openComments, setOpenComments] = useState({});

  const userEmail = localStorage.getItem("userEmail");

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
        body: JSON.stringify({ ticketId, user: "Student", message }),
      });
      setNewComments(prev => ({ ...prev, [ticketId]: "" }));
      const res  = await fetch(`http://localhost:8081/api/comments/${ticketId}`);
      const data = await res.json();
      setComments(prev => ({ ...prev, [ticketId]: data }));
    } catch (err) { console.error(err); }
  };

  const deleteTicket = async (ticketId, status) => {
    if (status !== "OPEN") { alert("Only OPEN tickets can be withdrawn."); return; }
    if (!window.confirm("Withdraw this ticket?")) return;
    try {
      await fetch(`http://localhost:8081/api/tickets/${ticketId}`, { method: "DELETE" });
      loadTickets();
    } catch (err) { console.error(err); }
  };

  const myTickets = tickets.filter(t => t.studentEmail === userEmail);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white text-lg shadow-lg shadow-sky-200">🎫</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
            <p className="text-sm text-slate-500">{userEmail || "No email linked"} · {myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && !userEmail && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔐</div>
          <p className="text-slate-500 font-medium">Submit a ticket first to link your email.</p>
        </div>
      )}

      {!loading && userEmail && myTickets.length === 0 && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-500 font-medium">No tickets found for your email.</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {myTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className={`h-1 w-full ${PRIORITY_DOT[ticket.priority] || "bg-slate-300"}`} />

            <div className="p-5">
              {/* Title */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{ticket.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{ticket.ticketCode}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[ticket.priority] || ""}`}>{ticket.priority}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[ticket.status] || ""}`}>{ticket.status}</span>
                </div>
              </div>

              {/* Student info */}
              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 rounded-xl p-3 mb-4">
                <span className="text-slate-500">👤 {ticket.createdBy}</span>
                <span className="text-slate-500">🪪 {ticket.studentId}</span>
                <span className="text-slate-500 col-span-2 truncate">📧 {ticket.studentEmail}</span>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-sm mb-4">
                <div className="flex gap-2"><span className="text-slate-400 w-24 flex-shrink-0">Category</span><span className="font-semibold text-slate-800">{ticket.category}</span></div>
                <div className="flex gap-2"><span className="text-slate-400 w-24 flex-shrink-0">Assigned To</span><span className="font-semibold text-slate-800">{ticket.assignedTo || "Not yet assigned"}</span></div>
                <div className="flex gap-2"><span className="text-slate-400 w-24 flex-shrink-0">Location</span><span className="font-semibold text-slate-800">{ticket.location || "—"}</span></div>
                <div className="flex gap-2"><span className="text-slate-400 w-24 flex-shrink-0">Resource</span><span className="font-semibold text-slate-800">{ticket.resourceName || "—"}</span></div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
              </div>

              {ticket.attachment && (
                <a href={`http://localhost:8081/uploads/${ticket.attachment}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors mb-4">
                  📎 View Attachment
                </a>
              )}

              {/* Actions */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <button onClick={() => toggleComments(ticket.id)}
                  className="w-full text-sm font-medium text-slate-600 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                  💬 {openComments[ticket.id] ? "Hide" : "View"} Comments
                  {comments[ticket.id]?.length > 0 && (
                    <span className="bg-sky-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{comments[ticket.id].length}</span>
                  )}
                </button>

                {openComments[ticket.id] && (
                  <div className="space-y-2">
                    {(comments[ticket.id] || []).map((c) => (
                      <div key={c.id} className={`flex gap-2 ${c.user === "Student" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.user === "Student" ? "bg-sky-100 text-sky-700" : "bg-indigo-100 text-indigo-700"}`}>
                          {c.user[0]}
                        </div>
                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${c.user === "Student" ? "bg-sky-600 text-white rounded-tr-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"}`}>
                          <p className="text-xs font-semibold opacity-70 mb-0.5">{c.user}</p>
                          {c.message}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Write a reply…"
                        value={newComments[ticket.id] || ""}
                        onChange={(e) => setNewComments(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addComment(ticket.id)}
                        className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                      <button onClick={() => addComment(ticket.id)}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm font-semibold">
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {ticket.status === "OPEN" && (
                  <button onClick={() => deleteTicket(ticket.id, ticket.status)}
                    className="w-full text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-2 rounded-lg transition-colors">
                    🗑️ Withdraw Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyTickets;