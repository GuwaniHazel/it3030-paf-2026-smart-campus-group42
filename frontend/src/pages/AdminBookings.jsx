import { useEffect, useState } from "react";

const STATUS_CONFIG = {
  PENDING:   { cls: "bg-amber-100 text-amber-700 border border-amber-200",    bar: "bg-amber-400",   icon: "⏳" },
  APPROVED:  { cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", bar: "bg-emerald-500", icon: "✅" },
  REJECTED:  { cls: "bg-rose-100 text-rose-700 border border-rose-200",      bar: "bg-rose-500",    icon: "❌" },
  CANCELLED: { cls: "bg-slate-100 text-slate-500 border border-slate-200",   bar: "bg-slate-400",   icon: "🚫" },
};

function AdminBookings() {
  const [bookings, setBookings]       = useState([]);
  const [rejectReasons, setRejectReasons] = useState({});
  const [loading, setLoading]         = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:8081/api/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadBookings(); }, []);

  const approveBooking = async (bookingId) => {
    try {
      await fetch(`http://localhost:8081/api/bookings/${bookingId}/approve`, { method: "PUT" });
      loadBookings();
    } catch (err) { console.error(err); }
  };

  const rejectBooking = async (bookingId) => {
    const reason = rejectReasons[bookingId];
    if (!reason?.trim()) { alert("Enter a rejection reason first."); return; }
    try {
      await fetch(`http://localhost:8081/api/bookings/${bookingId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      setRejectReasons(prev => ({ ...prev, [bookingId]: "" }));
      loadBookings();
    } catch (err) { console.error(err); }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await fetch(`http://localhost:8081/api/bookings/${bookingId}/cancel`, { method: "PUT" });
      loadBookings();
    } catch (err) { console.error(err); }
  };

  const counts = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "PENDING").length,
    approved:  bookings.filter(b => b.status === "APPROVED").length,
    rejected:  bookings.filter(b => b.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/40 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white text-lg shadow-lg shadow-violet-200">🏛️</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
            <p className="text-sm text-slate-500">Admin desk · manage all campus resource requests</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: counts.total,    color: "bg-slate-100 text-slate-800"    },
            { label: "Pending",  value: counts.pending,  color: "bg-amber-50 text-amber-700"     },
            { label: "Approved", value: counts.approved, color: "bg-emerald-50 text-emerald-700" },
            { label: "Rejected", value: counts.rejected, color: "bg-rose-50 text-rose-700"       },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-3 text-center border border-white/60 shadow-sm`}>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs font-semibold mt-0.5 opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-500 font-medium">No booking requests yet.</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {bookings.map((booking) => {
          const { cls, bar, icon } = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
          const isPending = booking.status === "PENDING";

          return (
            <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className={`h-1.5 w-full ${bar}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <h3 className="font-bold text-slate-900">Booking #{booking.id}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Resource ID: {booking.resourceId} · User: #{booking.userId}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${cls}`}>{booking.status}</span>
                </div>

                {/* Info grid */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm mb-4">
                  <Row icon="📆" label="Date"      value={booking.date} />
                  <Row icon="🕐" label="Time"      value={`${booking.startTime} – ${booking.endTime}`} />
                  <Row icon="👥" label="Attendees" value={`${booking.attendees} people`} />
                  <Row icon="🕑" label="Booked"    value={booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "—"} />
                  <div className="pt-1 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Purpose</p>
                    <p className="text-slate-700 font-medium">{booking.purpose}</p>
                  </div>
                </div>

                {/* Rejection reason display */}
                {booking.rejectionReason && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Rejection Reason</p>
                    <p className="text-sm text-rose-700">{booking.rejectionReason}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  {isPending && (
                    <button onClick={() => approveBooking(booking.id)}
                      className="w-full py-2.5 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-200">
                      ✅ Approve Booking
                    </button>
                  )}

                  {isPending && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Rejection reason…"
                        value={rejectReasons[booking.id] || ""}
                        onChange={(e) => setRejectReasons(prev => ({ ...prev, [booking.id]: e.target.value }))}
                        className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                      <button onClick={() => rejectBooking(booking.id)}
                        className="px-4 py-2 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors flex-shrink-0 shadow-sm shadow-rose-200">
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                    <button onClick={() => cancelBooking(booking.id)}
                      className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors">
                      🚫 Cancel
                    </button>
                  )}

                  {!isPending && booking.status !== "APPROVED" && (
                    <div className="text-center text-sm text-slate-400 py-2">
                      No actions available · {booking.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-5">{icon}</span>
      <span className="text-slate-500 font-medium w-20 flex-shrink-0">{label}</span>
      <span className="text-slate-800 font-semibold">{value}</span>
    </div>
  );
}

export default AdminBookings;
