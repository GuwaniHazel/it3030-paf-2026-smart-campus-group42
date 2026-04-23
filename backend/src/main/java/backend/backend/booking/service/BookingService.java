package backend.backend.booking.service;

import backend.backend.booking.model.Booking;
import backend.backend.booking.model.BookingStatus;
import backend.backend.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * BookingService – Module B: Booking Management (Complete – Day 1 to Day 6)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LAYERED ARCHITECTURE:
 *   HTTP Request → Controller → Service → Repository → Database
 *
 * WHY A SERVICE LAYER?
 *   • The Controller only handles HTTP (receives request, returns response).
 *   • ALL business logic lives here — not in the Controller.
 *   • This keeps each layer focused on one responsibility (clean architecture).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Methods provided:
 *   1. createBooking()    – validate + conflict check + save as PENDING
 *   2. getAllBookings()   – return every booking (admin use)
 *   3. getBookingById()  – return one booking by id
 *   4. getUserBookings() – return all bookings for a specific user
 *   5. approveBooking()  – admin sets status to APPROVED
 *   6. rejectBooking()   – admin sets status to REJECTED + stores reason
 *   7. cancelBooking()   – user sets status to CANCELLED
 *   8. hasConflict()     – helper: overlap check against APPROVED bookings
 *
 * @Service – Spring creates and manages one instance of this class.
 */
@Service
public class BookingService {

    // ─────────────────────────────────────────────
    // DEPENDENCY INJECTION
    // ─────────────────────────────────────────────

    private final BookingRepository bookingRepository;

    /**
     * Constructor injection — the recommended Spring way.
     * Spring automatically provides the BookingRepository bean here.
     * This also makes the class easy to unit-test without Spring.
     */
    @Autowired
    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // ─────────────────────────────────────────────
    // METHOD 1: CREATE BOOKING
    // ─────────────────────────────────────────────

    /**
     * Validates a new booking request and saves it if all rules pass.
     *
     * Validation Rules (applied in order):
     *   1. startTime must be before endTime.
     *   2. attendees must be greater than 0.
     *   3. Booking date cannot be in the past.
     *   4. No time conflict with an existing APPROVED booking
     *      for the same resource on the same date.
     *
     * If all validations pass:
     *   → Status is forced to PENDING (user cannot set their own status).
     *   → Booking is saved to the database.
     *
     * @param booking  Booking object from the request body
     * @return         Saved Booking with generated id and createdAt
     * @throws IllegalArgumentException if any validation or conflict check fails
     */
    public Booking createBooking(Booking booking) {

        // ── VALIDATION 1: Null time check ────────────────────────────────
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required.");
        }

        // ── VALIDATION 2: Time range — start must be before end ──────────
        // Example: 09:00 → 11:00 is valid.  11:00 → 09:00 is NOT valid.
        if (!booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new IllegalArgumentException(
                "Start time must be before end time. " +
                "Received: startTime=" + booking.getStartTime() +
                ", endTime=" + booking.getEndTime()
            );
        }

        // ── VALIDATION 3: Attendees must be at least 1 ───────────────────
        if (booking.getAttendees() <= 0) {
            throw new IllegalArgumentException(
                "Number of attendees must be greater than 0. " +
                "Received: " + booking.getAttendees()
            );
        }

        // ── VALIDATION 4: Booking date cannot be in the past ─────────────
        // LocalDate.now() gives today's date (server time).
        // isBefore(today) → the requested date is yesterday or earlier → reject.
        if (booking.getDate() == null) {
            throw new IllegalArgumentException("Booking date is required.");
        }

        if (booking.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                "Booking date cannot be in the past. " +
                "Received: " + booking.getDate()
            );
        }

        // ── VALIDATION 5: Conflict Detection ─────────────────────────────
        // Check whether this time slot clashes with any APPROVED booking
        // for the same resource on the same date.
        if (hasConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime())) {

            // Do NOT save — return a clear error message.
            throw new IllegalArgumentException(
                "Booking conflict detected for selected time range"
            );
        }

        // ── Force status = PENDING ────────────────────────────────────────
        // No matter what the client sends, every new booking starts as PENDING.
        // Status changes only through admin approve/reject or user cancel.
        booking.setStatus(BookingStatus.PENDING);

        // ── Save to database ──────────────────────────────────────────────
        // JPA triggers @PrePersist → sets createdAt automatically.
        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────
    // METHOD 2: GET ALL BOOKINGS  (Admin use)
    // ─────────────────────────────────────────────

    /**
     * Returns every booking in the database.
     * Intended for the admin dashboard — view all requests system-wide.
     *
     * @return List of all Booking records (empty list if none exist)
     */
    public List<Booking> getAllBookings() {
        // JpaRepository provides findAll() automatically — no SQL needed.
        return bookingRepository.findAll();
    }

    // ─────────────────────────────────────────────
    // METHOD 3: GET BOOKING BY ID
    // ─────────────────────────────────────────────

    /**
     * Returns a single booking by its primary key.
     *
     * @param id  Primary key of the booking
     * @return    The Booking if found
     * @throws RuntimeException if no booking exists with that id (→ 404)
     */
    public Booking getBookingById(Long id) {
        // findById() returns Optional<Booking>.
        // orElseThrow() → if empty, throw RuntimeException with a helpful message.
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                    "Booking not found with id: " + id
                ));
    }

    // ─────────────────────────────────────────────
    // METHOD 4: GET USER'S OWN BOOKINGS
    // ─────────────────────────────────────────────

    /**
     * Returns all bookings belonging to a specific user.
     * Used for the "My Bookings" feature — a user sees only their own records.
     *
     * @param userId  The ID of the user
     * @return        List of bookings made by that user
     */
    public List<Booking> getUserBookings(Long userId) {
        // Custom repository method — Spring Data generates:
        //   SELECT * FROM bookings WHERE user_id = ?
        return bookingRepository.findByUserId(userId);
    }

    // ─────────────────────────────────────────────
    // METHOD 5: APPROVE BOOKING  (Admin action)
    // ─────────────────────────────────────────────

    /**
     * Admin approves a booking — changes its status to APPROVED.
     *
     * Steps:
     *   1. Find the booking (throws 404 if not found).
     *   2. Set status to APPROVED.
     *   3. Save and return the updated booking.
     *
     * @param id  ID of the booking to approve
     * @return    Updated Booking with status = APPROVED
     * @throws RuntimeException if booking not found
     */
    public Booking approveBooking(Long id) {

        // Step 1: Find the booking (reuses getBookingById — throws if not found).
        Booking booking = getBookingById(id);

        // Step 2: Update status to APPROVED.
        // JPA will run an UPDATE (not INSERT) because the id already exists.
        booking.setStatus(BookingStatus.APPROVED);

        // Step 3: Save the updated booking to the database.
        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────
    // METHOD 6: REJECT BOOKING  (Admin action)
    // ─────────────────────────────────────────────

    /**
     * Admin rejects a booking — changes status to REJECTED and stores the reason.
     *
     * Steps:
     *   1. Find the booking (throws 404 if not found).
     *   2. Set status to REJECTED.
     *   3. Store the rejection reason (saved to rejection_reason column).
     *   4. Save and return the updated booking.
     *
     * @param id     ID of the booking to reject
     * @param reason The reason written by the admin (e.g., "Resource unavailable")
     * @return       Updated Booking with status = REJECTED and rejectionReason stored
     * @throws RuntimeException if booking not found
     */
    public Booking rejectBooking(Long id, String reason) {

        // Step 1: Find the booking.
        Booking booking = getBookingById(id);

        // Step 2: Set status to REJECTED.
        booking.setStatus(BookingStatus.REJECTED);

        // Step 3: Store the rejection reason so the user can see why it was refused.
        booking.setRejectionReason(reason);

        // Step 4: Save and return.
        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────
    // METHOD 7: CANCEL BOOKING  (User action)
    // ─────────────────────────────────────────────

    /**
     * User cancels their own booking — changes status to CANCELLED.
     *
     * Business Rule:
     *   Only bookings with status PENDING or APPROVED can be cancelled.
     *   A booking that is already REJECTED or CANCELLED cannot be cancelled again.
     *
     * Steps:
     *   1. Find the booking (throws 404 if not found).
     *   2. Check if the current status allows cancellation.
     *   3. Set status to CANCELLED.
     *   4. Save and return the updated booking.
     *
     * @param id  ID of the booking to cancel
     * @return    Updated Booking with status = CANCELLED
     * @throws RuntimeException     if booking not found
     * @throws IllegalStateException if booking cannot be cancelled (wrong status)
     */
    public Booking cancelBooking(Long id) {

        // Step 1: Find the booking.
        Booking booking = getBookingById(id);

        // Step 2: Only PENDING or APPROVED bookings can be cancelled.
        // REJECTED → already refused, nothing to cancel.
        // CANCELLED → already cancelled, no need to cancel again.
        if (booking.getStatus() == BookingStatus.REJECTED ||
            booking.getStatus() == BookingStatus.CANCELLED) {

            throw new IllegalStateException(
                "Cannot cancel a booking with status: " + booking.getStatus() +
                ". Only PENDING or APPROVED bookings can be cancelled."
            );
        }

        // Step 3: Set status to CANCELLED.
        booking.setStatus(BookingStatus.CANCELLED);

        // Step 4: Save and return.
        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────
    // METHOD 8: CONFLICT DETECTION  (Internal helper)
    // ─────────────────────────────────────────────

    /**
     * Checks if a proposed time slot overlaps with any existing APPROVED booking
     * for the same resource on the same date.
     *
     * ┌───────────────────────────────────────────────────────────────────┐
     * │  OVERLAP FORMULA  (industry-standard interval overlap check)      │
     * │                                                                   │
     * │  Two time slots [A_start, A_end) and [B_start, B_end) overlap    │
     * │  when BOTH of the following are true:                             │
     * │                                                                   │
     * │    newStartTime  <  existingEndTime                               │
     * │    newEndTime    >  existingStartTime                             │
     * │                                                                   │
     * │  Visual examples:                                                 │
     * │    Existing :  [09:00 ──────────── 11:00]                        │
     * │    New A    :        [10:00 ─────────────── 12:00] ← CONFLICT    │
     * │    New B    :  [07:00 ─── 09:00]                   ← No conflict │
     * │    New C    :                      [11:00 ── 13:00]← No conflict │
     * └───────────────────────────────────────────────────────────────────┘
     *
     * @param resourceId  ID of the campus resource
     * @param date        Requested date
     * @param startTime   Requested start time
     * @param endTime     Requested end time
     * @return  true  → conflict found, do NOT save the booking
     *          false → no conflict, safe to save
     */
    public boolean hasConflict(Long resourceId, LocalDate date,
                               LocalTime startTime, LocalTime endTime) {

        // STEP 1: Fetch all APPROVED bookings for this resource on this date.
        //
        // WHY only APPROVED?
        //   PENDING   → not yet confirmed; should not block other requests.
        //   REJECTED  → booking refused; slot is free.
        //   CANCELLED → user cancelled; slot is free.
        //   APPROVED  → slot is definitively reserved → must check these.
        List<Booking> approvedBookings = bookingRepository
                .findByResourceIdAndDateAndStatus(resourceId, date, BookingStatus.APPROVED);

        // STEP 2: Check each approved booking using the overlap formula.
        for (Booking existing : approvedBookings) {

            // Condition A: new booking starts before the existing one ends
            // Condition B: new booking ends after the existing one starts
            // BOTH must be true for a conflict to exist.
            boolean overlaps =
                    startTime.isBefore(existing.getEndTime())   // Condition A
                 && endTime.isAfter(existing.getStartTime());   // Condition B

            if (overlaps) {
                return true;  // ← Conflict found — do NOT save
            }
        }

        // STEP 3: No conflict found — safe to book.
        return false;
    }
}
