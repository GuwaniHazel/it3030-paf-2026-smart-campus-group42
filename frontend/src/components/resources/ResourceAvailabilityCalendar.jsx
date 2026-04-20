import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const MOCK_BOOKINGS = [
  { id: 1, resourceId: 1, date: "2026-04-20", startTime: "09:00", endTime: "11:00", user: "John Doe" },
  { id: 2, resourceId: 1, date: "2026-04-20", startTime: "14:00", endTime: "16:00", user: "Jane Smith" },
  { id: 3, resourceId: 1, date: "2026-04-21", startTime: "10:00", endTime: "12:00", user: "Mike Brown" },
  { id: 4, resourceId: 2, date: "2026-04-20", startTime: "13:00", endTime: "15:00", user: "Sarah Lee" },
];

const pad = (value) => String(value).padStart(2, "0");

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${pad(hours)}:${pad(mins)}`;
};

const rangesOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const expandBookingToSlots = (booking, slotMinutes) => {
  const start = timeToMinutes(booking.startTime);
  const end = timeToMinutes(booking.endTime);
  const slots = [];

  for (let minute = start; minute < end; minute += slotMinutes) {
    slots.push(minutesToTime(minute));
  }

  return slots;
};

const ResourceAvailabilityCalendar = ({
  resourceId = 1,
  resourceName = "Selected Resource",
  initialBookings = MOCK_BOOKINGS,
  dayStartTime = "08:00",
  dayEndTime = "18:00",
  slotMinutes = 60,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [feedback, setFeedback] = useState("");

  const currentDateKey = toDateKey(selectedDate);
  const dayStart = timeToMinutes(dayStartTime);
  const dayEnd = timeToMinutes(dayEndTime);

  const allSlotsForDay = useMemo(() => {
    const slots = [];
    for (let minute = dayStart; minute < dayEnd; minute += slotMinutes) {
      slots.push(minutesToTime(minute));
    }
    return slots;
  }, [dayStart, dayEnd, slotMinutes]);

  const resourceBookings = useMemo(
    () => bookings.filter((booking) => booking.resourceId === resourceId),
    [bookings, resourceId]
  );

  const bookingsByDate = useMemo(() => {
    const grouped = new Map();

    for (const booking of resourceBookings) {
      const existing = grouped.get(booking.date) || [];
      existing.push(booking);
      grouped.set(booking.date, existing);
    }

    return grouped;
  }, [resourceBookings]);

  const bookedSlotsForSelectedDate = useMemo(() => {
    const dayBookings = bookingsByDate.get(currentDateKey) || [];
    const occupied = new Set();

    for (const booking of dayBookings) {
      const bookingSlots = expandBookingToSlots(booking, slotMinutes);
      bookingSlots.forEach((slot) => occupied.add(slot));
    }

    return occupied;
  }, [bookingsByDate, currentDateKey, slotMinutes]);

  const availableSlotsForSelectedDate = useMemo(
    () => allSlotsForDay.filter((slot) => !bookedSlotsForSelectedDate.has(slot)),
    [allSlotsForDay, bookedSlotsForSelectedDate]
  );

  const bookedRangesForSelectedDate = useMemo(
    () => (bookingsByDate.get(currentDateKey) || []).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookingsByDate, currentDateKey]
  );

  const getDateAvailabilityState = (date) => {
    const dateKey = toDateKey(date);
    const dayBookings = bookingsByDate.get(dateKey) || [];

    if (!dayBookings.length) return "full-available";

    const occupiedSlots = new Set();
    for (const booking of dayBookings) {
      expandBookingToSlots(booking, slotMinutes).forEach((slot) => occupiedSlots.add(slot));
    }

    if (occupiedSlots.size === 0) return "full-available";
    if (occupiedSlots.size >= allSlotsForDay.length) return "fully-booked";
    return "partial";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const state = getDateAvailabilityState(date);
    const dotClass =
      state === "fully-booked"
        ? "bg-red-500"
        : state === "partial"
          ? "bg-yellow-400"
          : "bg-green-500";

    return <span className={`mx-auto mt-1 block h-2 w-2 rounded-full ${dotClass}`} />;
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "rounded-lg";

    const state = getDateAvailabilityState(date);

    if (state === "fully-booked") return "rounded-lg !bg-red-50 !text-red-700 dark:!bg-red-900/50 dark:!text-red-300";
    if (state === "partial") return "rounded-lg !bg-yellow-50 !text-yellow-700 dark:!bg-yellow-900/50 dark:!text-yellow-300";
    return "rounded-lg !bg-green-50 !text-green-700 dark:!bg-green-900/50 dark:!text-green-300";
  };

  const isSlotAvailable = (slotStartTime) => {
    if (!slotStartTime) return false;

    const slotStart = timeToMinutes(slotStartTime);
    const slotEnd = slotStart + slotMinutes;
    const dayBookings = bookingsByDate.get(currentDateKey) || [];

    return !dayBookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      return rangesOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
    });
  };

  const selectedSlotStatus = selectedSlot
    ? isSlotAvailable(selectedSlot)
      ? "Available"
      : "Booked"
    : "Choose a time slot";

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
    setFeedback("");
  };

  const handleTryBooking = () => {
    if (!selectedSlot) {
      setFeedback("Please select a time slot first.");
      return;
    }

    if (!isSlotAvailable(selectedSlot)) {
      setFeedback(`Slot ${selectedSlot} is already booked.`);
      return;
    }

    const start = timeToMinutes(selectedSlot);
    const endTime = minutesToTime(start + slotMinutes);

    const newBooking = {
      id: Date.now(),
      resourceId,
      date: currentDateKey,
      startTime: selectedSlot,
      endTime,
      user: "Current User",
    };

    setBookings((previous) => [...previous, newBooking]);
    setFeedback(`Booking confirmed for ${currentDateKey} (${selectedSlot} - ${endTime}).`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">Resource Availability Calendar</p>
        <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-gray-100">{resourceName}</h3>
      </div>

      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={tileClassName}
        tileContent={tileContent}
        className={[
          "w-full border-0 bg-transparent text-slate-900 dark:text-gray-100",
          "[&_.react-calendar__month-view__weekdays]:text-slate-500",
          "dark:[&_.react-calendar__month-view__weekdays]:text-gray-400",
          "[&_.react-calendar__month-view__days__day]:bg-slate-50",
          "dark:[&_.react-calendar__month-view__days__day]:bg-gray-800",
          "[&_.react-calendar__tile]:rounded-lg [&_.react-calendar__tile]:transition-colors",
          "[&_.react-calendar__tile:enabled:hover]:bg-slate-100",
          "dark:[&_.react-calendar__tile:enabled:hover]:bg-gray-700",
          "[&_.react-calendar__tile--active]:!bg-blue-100 [&_.react-calendar__tile--active]:!text-blue-900",
          "dark:[&_.react-calendar__tile--active]:!bg-blue-900 dark:[&_.react-calendar__tile--active]:!text-blue-100",
          "[&_.react-calendar__navigation_button]:rounded-lg [&_.react-calendar__navigation_button]:text-slate-700",
          "dark:[&_.react-calendar__navigation_button]:text-gray-200",
          "[&_.react-calendar__navigation_button:enabled:hover]:bg-slate-100",
          "dark:[&_.react-calendar__navigation_button:enabled:hover]:bg-gray-700",
        ].join(" ")}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500 dark:bg-red-400" /> Fully booked</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400 dark:bg-yellow-300" /> Partially available</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-500 dark:bg-green-400" /> Fully available</span>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-sm font-bold text-slate-800 dark:text-gray-100">{currentDateKey} Time Slots</h4>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">Available slots</p>
            <ul className="max-h-48 space-y-2 overflow-auto pr-1">
              {availableSlotsForSelectedDate.length === 0 && (
                <li className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-300">No slots available</li>
              )}
              {availableSlotsForSelectedDate.map((slot) => (
                <li key={`available-${slot}`} className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  {slot} - {minutesToTime(timeToMinutes(slot) + slotMinutes)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">Booked slots</p>
            <ul className="max-h-48 space-y-2 overflow-auto pr-1">
              {bookedRangesForSelectedDate.length === 0 && (
                <li className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-gray-700 dark:text-gray-300">No bookings yet</li>
              )}
              {bookedRangesForSelectedDate.map((booking) => (
                <li key={`booked-${booking.id}`} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  {booking.startTime} - {booking.endTime} ({booking.user})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">Real-time availability check</p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedSlot}
            onChange={(event) => {
              setSelectedSlot(event.target.value);
              setFeedback("");
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">Select time slot</option>
            {allSlotsForDay.map((slot) => (
              <option key={slot} value={slot}>
                {slot} - {minutesToTime(timeToMinutes(slot) + slotMinutes)}
              </option>
            ))}
          </select>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              selectedSlotStatus === "Available"
                ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                : selectedSlotStatus === "Booked"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                  : "bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {selectedSlotStatus}
          </span>

          <button
            type="button"
            onClick={handleTryBooking}
            disabled={!selectedSlot || selectedSlotStatus === "Booked"}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Book Selected Slot
          </button>
        </div>

        {feedback && (
          <p className={`mt-3 text-sm font-medium ${feedback.includes("confirmed") ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResourceAvailabilityCalendar;
