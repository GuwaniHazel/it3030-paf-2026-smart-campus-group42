import { useEffect, useState } from "react";

// Matches MyTickets.jsx pattern exactly:
//  - function keyword declaration
//  - userId from localStorage (same as userEmail in tickets)
//  - direct fetch() for data loading
//  - .ticket-card / .ticket-header / .ticket-title / .ticket-section CSS classes
//  - .booking-status ${status} for the status badge
//  - window.confirm() before destructive action
//  - alert() for feedback

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const userId = localStorage.getItem("bookingUserId");

  const loadBookings = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/bookings/user/${userId}`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (bookingId, status) => {
    if (status === "REJECTED" || status === "CANCELLED") {
      alert(`Cannot cancel a booking with status: ${status}. Only PENDING or APPROVED bookings can be cancelled.`);
      return;
    }

    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      await fetch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {
        method: "PUT"
      });
      alert("Booking cancelled successfully");
      loadBookings();
    } catch (err) {
      console.error(err);
      alert("Error cancelling booking");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Bookings</h2>

      {!userId ? (
        <p>Please submit a booking first to link your User ID.</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found for User ID: {userId}</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="ticket-card">

            {/* Header: resource info + status badge */}
            <div className="ticket-header">
              <span className="ticket-title">
                Booking #{booking.id} — Resource ID: {booking.resourceId}
              </span>
              <span className={`booking-status ${booking.status}`}>
                {booking.status}
              </span>
            </div>

            <p className="ticket-section"><b>Date:</b> {booking.date}</p>
            <p className="ticket-section"><b>Time:</b> {booking.startTime} – {booking.endTime}</p>
            <p className="ticket-section"><b>Purpose:</b> {booking.purpose}</p>
            <p className="ticket-section"><b>Attendees:</b> {booking.attendees}</p>
            <p className="ticket-section"><b>Status:</b> {booking.status}</p>

            {booking.rejectionReason && (
              <p className="ticket-section">
                <b>Rejection Reason:</b> {booking.rejectionReason}
              </p>
            )}

            <p className="ticket-section">
              <b>Booked On:</b>{" "}
              {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "-"}
            </p>

            <hr />

            <div className="ticket-actions">
              <button
                onClick={() => cancelBooking(booking.id, booking.status)}
                className="cancel-btn"
              >
                Cancel Booking
              </button>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;
