import { useEffect, useState } from "react";

// Matches AdminTickets.jsx pattern exactly:
//  - function keyword declaration
//  - separate state for per-card inputs (rejectReasons)
//  - direct fetch() for all operations
//  - .ticket-card / .ticket-header / .ticket-title CSS classes
//  - .booking-status ${status} badge
//  - .ticket-actions rows for each action group
//  - alert() for all feedback

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [rejectReasons, setRejectReasons] = useState({});

  const loadBookings = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleReasonChange = (bookingId, value) => {
    setRejectReasons((prev) => ({ ...prev, [bookingId]: value }));
  };

  const approveBooking = async (bookingId) => {
    try {
      await fetch(`http://localhost:8080/api/bookings/${bookingId}/approve`, {
        method: "PUT"
      });
      alert("Booking approved successfully");
      loadBookings();
    } catch (err) {
      console.error(err);
      alert("Error approving booking");
    }
  };

  const rejectBooking = async (bookingId) => {
    const reason = rejectReasons[bookingId];
    if (!reason || reason.trim() === "") {
      alert("Please enter a rejection reason before rejecting");
      return;
    }

    try {
      await fetch(`http://localhost:8080/api/bookings/${bookingId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason })
      });
      alert("Booking rejected");
      setRejectReasons((prev) => ({ ...prev, [bookingId]: "" }));
      loadBookings();
    } catch (err) {
      console.error(err);
      alert("Error rejecting booking");
    }
  };

  const cancelBooking = async (bookingId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      await fetch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {
        method: "PUT"
      });
      alert("Booking cancelled");
      loadBookings();
    } catch (err) {
      console.error(err);
      alert("Error cancelling booking");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Booking Management</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="ticket-card">

            {/* Header: booking info + status badge */}
            <div className="ticket-header">
              <span className="ticket-title">
                Booking #{booking.id} — Resource ID: {booking.resourceId}
              </span>
              <span className={`booking-status ${booking.status}`}>
                {booking.status}
              </span>
            </div>

            <p><b>User ID:</b> {booking.userId}</p>
            <p><b>Date:</b> {booking.date}</p>
            <p><b>Time:</b> {booking.startTime} – {booking.endTime}</p>
            <p><b>Purpose:</b> {booking.purpose}</p>
            <p><b>Attendees:</b> {booking.attendees}</p>
            <p><b>Status:</b> {booking.status}</p>

            {booking.rejectionReason && (
              <p><b>Rejection Reason:</b> {booking.rejectionReason}</p>
            )}

            <p>
              <b>Booked On:</b>{" "}
              {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "-"}
            </p>

            <hr />

            {/* Approve action */}
            <div className="ticket-actions">
              <button onClick={() => approveBooking(booking.id)} className="approve-btn">
                ✅ Approve
              </button>
            </div>

            {/* Reject with reason input */}
            <div className="ticket-actions">
              <input
                type="text"
                placeholder="Enter rejection reason..."
                value={rejectReasons[booking.id] || ""}
                onChange={(e) => handleReasonChange(booking.id, e.target.value)}
              />
              <button onClick={() => rejectBooking(booking.id)} className="delete-btn">
                ❌ Reject
              </button>
            </div>

            {/* Cancel action */}
            <div className="delete-container-left">
              <button onClick={() => cancelBooking(booking.id)} className="cancel-btn">
                Cancel
              </button>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default AdminBookings;
