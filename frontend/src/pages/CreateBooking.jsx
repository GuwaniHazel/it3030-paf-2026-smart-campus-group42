import { useState } from "react";

function CreateBooking({ onSuccess }) {
  const [booking, setBooking] = useState({
    userId:     "",
    resourceId: "",
    date:       "",
    startTime:  "",
    endTime:    "",
    purpose:    "",
    attendees:  ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBooking({ ...booking, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!booking.userId.trim())
      newErrors.userId = "User ID is required";

    if (!booking.resourceId.trim())
      newErrors.resourceId = "Resource ID is required";

    if (!booking.date)
      newErrors.date = "Booking date is required";

    if (!booking.startTime)
      newErrors.startTime = "Start time is required";

    if (!booking.endTime)
      newErrors.endTime = "End time is required";

    if (!booking.purpose.trim())
      newErrors.purpose = "Purpose is required";

    if (!booking.attendees || Number(booking.attendees) <= 0)
      newErrors.attendees = "Attendees must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:8081/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:     Number(booking.userId),
          resourceId: Number(booking.resourceId),
          date:       booking.date,
          startTime:  booking.startTime,
          endTime:    booking.endTime,
          purpose:    booking.purpose,
          attendees:  Number(booking.attendees)
        })
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg);
      }

      localStorage.setItem("bookingUserId", booking.userId);

      alert("Booking submitted successfully! Status: PENDING");

      setBooking({ userId: "", resourceId: "", date: "", startTime: "", endTime: "", purpose: "", attendees: "" });
      setErrors({});

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      alert(error.message || "Error submitting booking");
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "24px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>New Booking Request</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Fill in the details to request a campus resource. Your booking will be reviewed by an admin.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          <div>
            <label>Your User ID</label>
            <input
              type="number"
              name="userId"
              placeholder="e.g. 1"
              value={booking.userId}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.userId && <p style={errorStyle}>{errors.userId}</p>}
          </div>

          <div>
            <label>Resource ID</label>
            <input
              type="number"
              name="resourceId"
              placeholder="e.g. 5"
              value={booking.resourceId}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.resourceId && <p style={errorStyle}>{errors.resourceId}</p>}
          </div>

          <div>
            <label>Booking Date</label>
            <input
              type="date"
              name="date"
              value={booking.date}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.date && <p style={errorStyle}>{errors.date}</p>}
          </div>

          <div>
            <label>Number of Attendees</label>
            <input
              type="number"
              name="attendees"
              min="1"
              placeholder="e.g. 10"
              value={booking.attendees}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.attendees && <p style={errorStyle}>{errors.attendees}</p>}
          </div>

          <div>
            <label>Start Time</label>
            <input
              type="time"
              name="startTime"
              value={booking.startTime}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.startTime && <p style={errorStyle}>{errors.startTime}</p>}
          </div>

          <div>
            <label>End Time</label>
            <input
              type="time"
              name="endTime"
              value={booking.endTime}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.endTime && <p style={errorStyle}>{errors.endTime}</p>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Purpose</label>
            <textarea
              name="purpose"
              placeholder="e.g. Group study session for PAF assignment"
              value={booking.purpose}
              onChange={handleChange}
              rows="4"
              style={{ ...inputStyle, resize: "vertical" }}
            />
            {errors.purpose && <p style={errorStyle}>{errors.purpose}</p>}
          </div>

        </div>

        <div style={{ marginTop: "24px" }}>
          <button type="submit" style={buttonStyle}>
            Submit Booking Request
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box"
};

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "bold"
};

const errorStyle = {
  color: "red",
  fontSize: "13px",
  marginTop: "5px",
  marginBottom: "0"
};

export default CreateBooking;
