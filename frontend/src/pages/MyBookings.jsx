import { useEffect, useState } from "react";

const STATUS_CONFIG = {
  PENDING:   { cls: "bg-amber-100 text-amber-700 border border-amber-200",    bar: "bg-amber-400",   icon: "⏳" },
  APPROVED:  { cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", bar: "bg-emerald-500", icon: "✅" },
  REJECTED:  { cls: "bg-rose-100 text-rose-700 border border-rose-200",      bar: "bg-rose-500",    icon: "❌" },
  CANCELLED: { cls: "bg-slate-100 text-slate-500 border border-slate-200",   bar: "bg-slate-400",   icon: "🚫" },
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  const userId = localStorage.getItem("bookingUserId");

  const loadBookings = async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:8081/api/bookings/user/${userId}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadBookings(); }, []);

  const cancelBooking = async (bookingId, status) => {
    if (status === "REJECTED" || status === "CANCELLED") {
      alert(`Cannot cancel a ${status} booking.`); return;
    }
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await fetch(`http://localhost:8081/api/bookings/${bookingId}/cancel`, { method: "PUT" });
      loadBookings();
    } catch (err) { console.error(err); alert("Error cancelling booking"); }
  };

  const cfg = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white text-lg shadow-lg shadow-cyan-200">📅</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-sm text-slate-500">User #{userId || "—"} · {bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && !userId && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔗</div>
          <p className="text-slate-500 font-medium">Submit a booking first to link your User ID.</p>
        </div>
      )}

      {!loading && userId && bookings.length === 0 && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-500 font-medium">No bookings found for User #{userId}.</p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {bookings.map((booking) => {
          const { cls, bar, icon } = cfg(booking.status);
          const canCancel = booking.status === "PENDING" || booking.status === "APPROVED";

          return (
            <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              {/* Status color bar */}
              <div className={`h-1.5 w-full ${bar}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <h3 className="font-bold text-slate-900 text-base">Booking #{booking.id}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Resource ID: {booking.resourceId}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${cls}`}>{booking.status}</span>
                </div>

                {/* Info grid */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm mb-4">
                  <BookingRow icon="📆" label="Date" value={booking.date} />
                  <BookingRow icon="🕐" label="Time" value={`${booking.startTime} – ${booking.endTime}`} />
                  <BookingRow icon="👥" label="Attendees" value={`${booking.attendees} people`} />
                  <div className="pt-1 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Purpose</p>
                    <p className="text-slate-700 font-medium">{booking.purpose}</p>
                  </div>
                </div>

                {/* Rejection reason */}
                {booking.rejectionReason && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Rejection Reason</p>
                    <p className="text-sm text-rose-700">{booking.rejectionReason}</p>
                  </div>
                )}

                {/* Booked on */}
                <p className="text-xs text-slate-400 mb-4">
                  🕑 Booked on {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "—"}
                </p>

                {/* Cancel button */}
                {canCancel ? (
                  <button
                    onClick={() => cancelBooking(booking.id, booking.status)}
                    className="w-full py-2.5 text-sm font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-colors">
                    🚫 Cancel Booking
                  </button>
                ) : (
                  <div className="w-full py-2.5 text-sm text-center text-slate-400 bg-slate-50 rounded-xl">
                    Cannot cancel · {booking.status}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-5">{icon}</span>
      <span className="text-slate-500 font-medium w-20 flex-shrink-0">{label}</span>
      <span className="text-slate-800 font-semibold">{value}</span>
    </div>
  );
}

export default MyBookings;
