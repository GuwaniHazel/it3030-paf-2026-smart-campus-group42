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
 * BookingService – Module B: Booking Management (Day 4 – Conflict Detection)
 *
 * WHY DO WE NEED A SERVICE LAYER?
 * ─────────────────────────────────────────────────────
 * In Day 2 the Controller talked directly to the Repository:
 *   Controller → Repository → Database
 *
 * This is problematic because:
 *   1. Business logic (validation, rules) ends up mixed with HTTP handling.
 *   2. The Controller becomes bloated and hard to test/maintain.
 *   3. Code cannot be reused easily across different callers.
 *
 * The Service layer fixes this by:
 *   - Keeping the Controller thin (only handles HTTP concerns).
 *   - Centralising ALL business logic here.
 *   - Making the code easy to unit-test independently.
 *
 * Clean Architecture Flow (Day 4):
 *   HTTP Request → Controller → Service → Repository → Database
 * ─────────────────────────────────────────────────────
 *
 * @Service – marks this class as a Spring-managed service bean.
 *            Spring will automatically create one instance and inject it
 *            wherever it is needed (e.g., BookingController).
 */
@Service
public class BookingService {

    // ─────────────────────────────────────────────
    // DEPENDENCY INJECTION
    // ─────────────────────────────────────────────

    private final BookingRepository bookingRepository;

    /**
     * Constructor injection – the recommended way to inject dependencies in Spring.
     * Spring automatically provides the BookingRepository bean when creating this service.
     *
     * Constructor injection is preferred over @Autowired on fields because:
     *   - It makes dependencies explicit and visible.
     *   - It allows the class to be easily unit-tested without a Spring context.
     */
    @Autowired
    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // ─────────────────────────────────────────────
    // METHOD 1: CREATE BOOKING
    // ─────────────────────────────────────────────

    /**
     * Validates and saves a new booking to the database.
     *
     * Business Rules enforced here (NOT in the controller):
     *   1. startTime must be before endTime.
     *   2. attendees must be greater than 0.
     *   3. [DAY 4] No time conflict with an existing APPROVED booking
     *              for the same resource on the same date.
     *   4. Status is always forced to PENDING on creation.
     *
     * @param booking  The Booking object received from the controller
     * @return         The saved Booking (with generated id and createdAt timestamp)
     * @throws IllegalArgumentException if validation fails or a conflict is detected
     */
    public Booking createBooking(Booking booking) {

        // ── VALIDATION 1: Time range check ──────────────────────────────
        // startTime must be strictly before endTime.
        // Example: 09:00 → 11:00 is valid; 11:00 → 09:00 is NOT valid.
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required.");
        }

        if (!booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new IllegalArgumentException(
                "Start time must be before end time. " +
                "Received: startTime=" + booking.getStartTime() +
                ", endTime=" + booking.getEndTime()
            );
        }

        // ── VALIDATION 2: Attendees check ────────────────────────────────
        // A booking must have at least 1 attendee – 0 or negative makes no sense.
        if (booking.getAttendees() <= 0) {
            throw new IllegalArgumentException(
                "Number of attendees must be greater than 0. " +
                "Received: " + booking.getAttendees()
            );
        }

        // ── DAY 4 – VALIDATION 3: Conflict Detection ─────────────────────
        // Before saving, check whether the requested time slot clashes with
        // any already-APPROVED booking for the same resource on the same date.
        //
        // If hasConflict() returns true → refuse to save and throw an error.
        // The controller will catch this and return HTTP 400 Bad Request.
        if (hasConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime())) {

            throw new IllegalArgumentException(
                "Booking conflict detected for selected time range"
            );
        }

        // ── BUSINESS RULE: Force status to PENDING ───────────────────────
        // Regardless of what the client sends, every new booking starts as PENDING.
        // Only an admin can change the status later (approve/reject logic).
        booking.setStatus(BookingStatus.PENDING);

        // ── SAVE to database ─────────────────────────────────────────────
        // JPA will trigger @PrePersist → sets createdAt automatically.
        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────
    // METHOD 2: GET ALL BOOKINGS
    // ─────────────────────────────────────────────

    /**
     * Retrieves all bookings from the database.
     *
     * No additional business logic needed – just delegate to the repository.
     * Keeping this in the service (instead of calling the repo directly from
     * the controller) maintains a clean, consistent architecture.
     *
     * @return List of all Booking records (empty list if none exist)
     */
    public List<Booking> getAllBookings() {
        // findAll() is provided by JpaRepository – Spring Data generates the SQL.
        return bookingRepository.findAll();
    }

    // ─────────────────────────────────────────────
    // METHOD 3: GET BOOKING BY ID
    // ─────────────────────────────────────────────

    /**
     * Retrieves a single booking by its primary key (id).
     *
     * Exception Handling:
     *   If no booking exists with the given id, we throw a RuntimeException
     *   with a descriptive message. The Controller catches it and returns
     *   HTTP 404 Not Found.
     *
     * @param id  The primary key of the booking to retrieve
     * @return    The Booking object if found
     * @throws RuntimeException if no booking found with the given id
     */
    public Booking getBookingById(Long id) {
        // findById() returns Optional<Booking>.
        // orElseThrow() unwraps it:
        //   → If present : returns the Booking.
        //   → If empty   : throws RuntimeException with our custom message.
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                    "Booking not found with id: " + id
                ));
    }

    // ─────────────────────────────────────────────
    // METHOD 4: CONFLICT DETECTION  [DAY 4 – CORE FEATURE]
    // ─────────────────────────────────────────────

    /**
     * Checks whether a proposed time slot conflicts with any existing APPROVED
     * booking for the same resource on the same date.
     *
     * ┌──────────────────────────────────────────────────────────────────┐
     * │  OVERLAP RULE  (industry-standard interval overlap formula)      │
     * │                                                                  │
     * │  Two time intervals overlap when BOTH conditions are true:       │
     * │                                                                  │
     * │    newStartTime  <  existingEndTime                              │
     * │    newEndTime    >  existingStartTime                            │
     * │                                                                  │
     * │  Visual examples:                                                │
     * │    Existing :  [09:00 ──────────── 11:00]                       │
     * │    New A    :        [10:00 ────────────── 12:00]  ← CONFLICT   │
     * │    New B    :  [08:00 ─── 09:00]                   ← No conflict│
     * │    New C    :                      [11:00 ── 13:00]← No conflict│
     * └──────────────────────────────────────────────────────────────────┘
     *
     * @param resourceId  The campus resource being requested (e.g., room ID)
     * @param date        The date of the proposed booking
     * @param startTime   The proposed start time
     * @param endTime     The proposed end time
     * @return            true  → conflict found, caller must NOT save the booking
     *                    false → no conflict, safe to proceed
     */
    public boolean hasConflict(Long resourceId, LocalDate date,
                               LocalTime startTime, LocalTime endTime) {

        // STEP 1 – Fetch only APPROVED bookings for this resource on this date.
        //
        // We call the custom repository method added in Day 3:
        //   findByResourceIdAndDateAndStatus(resourceId, date, BookingStatus.APPROVED)
        //
        // WHY only APPROVED?
        //   • PENDING  – not yet confirmed; should not block other requests.
        //   • REJECTED – booking was refused; slot is free again.
        //   • CANCELLED – user cancelled; slot is free again.
        //   • APPROVED  – slot is definitively reserved → must check against these.
        List<Booking> approvedBookings = bookingRepository
                .findByResourceIdAndDateAndStatus(resourceId, date, BookingStatus.APPROVED);

        // STEP 2 – Apply the overlap rule to each approved booking.
        for (Booking existing : approvedBookings) {

            // OVERLAP CHECK:
            //   Condition A: newStartTime is BEFORE the existing booking ends
            //                → the new booking "reaches into" the existing slot.
            //   Condition B: newEndTime is AFTER the existing booking starts
            //                → the new booking "starts before" the existing slot ends.
            //
            // Both conditions must be true simultaneously for an overlap to exist.
            boolean overlaps =
                    startTime.isBefore(existing.getEndTime())   // Condition A
                 && endTime.isAfter(existing.getStartTime());   // Condition B

            if (overlaps) {
                // At least one conflict found – return immediately.
                return true;  // ← CONFLICT DETECTED
            }
        }

        // STEP 3 – No conflict found after checking all approved bookings.
        return false;  // ← SAFE TO BOOK
    }
}
