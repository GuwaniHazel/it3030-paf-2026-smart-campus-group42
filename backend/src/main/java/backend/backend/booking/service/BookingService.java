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
 * BookingService – Module B: Booking Management (Day 5 – Approve / Reject)
 *
 * Layered architecture flow:
 *   HTTP Request → Controller → Service → Repository → Database
 *
 * This service now covers:
 *   Day 3 – createBooking, getAllBookings, getBookingById (basic CRUD + validation)
 *   Day 4 – hasConflict (conflict detection before saving)
 *   Day 5 – approveBooking, rejectBooking (admin approval workflow)  ← NEW
 *
 * @Service – tells Spring to create and manage one instance of this class.
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
     */
    @Autowired
    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // ─────────────────────────────────────────────
    // METHOD 1: CREATE BOOKING  (Day 3 + Day 4)
    // ─────────────────────────────────────────────

    /**
     * Validates and saves a new booking to the database.
     *
     * Business Rules:
     *   1. startTime must be before endTime.
     *   2. attendees must be greater than 0.
     *   3. No time conflict with an existing APPROVED booking (Day 4).
     *   4. Status is always forced to PENDING on creation.
     *
     * @param booking  The Booking object received from the controller
     * @return         The saved Booking (with generated id and createdAt)
     * @throws IllegalArgumentException if validation fails or a conflict is detected
     */
    public Booking createBooking(Booking booking) {

        // ── VALIDATION 1: Time range check ──────────────────────────────
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
        if (booking.getAttendees() <= 0) {
            throw new IllegalArgumentException(
                "Number of attendees must be greater than 0. " +
                "Received: " + booking.getAttendees()
            );
        }

        // ── VALIDATION 3: Conflict Detection (Day 4) ─────────────────────
        if (hasConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime())) {

            throw new IllegalArgumentException(
                "Booking conflict detected for selected time range"
            );
        }

        // ── Force status to PENDING ──────────────────────────────────────
        booking.setStatus(BookingStatus.PENDING);

        // ── Save and return ──────────────────────────────────────────────
        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────
    // METHOD 2: GET ALL BOOKINGS  (Day 3)
    // ─────────────────────────────────────────────

    /**
     * Retrieves all bookings from the database.
     *
     * @return List of all Booking records (empty list if none exist)
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ─────────────────────────────────────────────
    // METHOD 3: GET BOOKING BY ID  (Day 3)
    // ─────────────────────────────────────────────

    /**
     * Retrieves a single booking by its primary key.
     *
     * @param id  The primary key of the booking to retrieve
     * @return    The Booking object if found
     * @throws RuntimeException if no booking found with the given id
     */
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                    "Booking not found with id: " + id
                ));
    }

    // ─────────────────────────────────────────────
    // METHOD 4: CONFLICT DETECTION  (Day 4)
    // ─────────────────────────────────────────────

    /**
     * Checks whether a proposed time slot conflicts with any existing APPROVED
     * booking for the same resource on the same date.
     *
     * Overlap Rule (must both be true for a conflict):
     *   newStartTime < existingEndTime
     *   AND
     *   newEndTime   > existingStartTime
     *
     * @return true if a conflict exists, false if the slot is free
     */
    public boolean hasConflict(Long resourceId, LocalDate date,
                               LocalTime startTime, LocalTime endTime) {

        // Fetch only APPROVED bookings – PENDING/REJECTED/CANCELLED do not block the slot.
        List<Booking> approvedBookings = bookingRepository
                .findByResourceIdAndDateAndStatus(resourceId, date, BookingStatus.APPROVED);

        for (Booking existing : approvedBookings) {
            boolean overlaps =
                    startTime.isBefore(existing.getEndTime())
                 && endTime.isAfter(existing.getStartTime());

            if (overlaps) {
                return true;  // Conflict detected
            }
        }

        return false;  // No conflict
    }

    // ─────────────────────────────────────────────
    // METHOD 5: APPROVE BOOKING  [DAY 5 – NEW]
    // ─────────────────────────────────────────────

    /**
     * Approves a booking by setting its status to APPROVED.
     *
     * Steps:
     *   1. Find the booking by id (throws exception if not found).
     *   2. Change the status from PENDING → APPROVED.
     *   3. Save the updated booking back to the database.
     *   4. Return the updated booking.
     *
     * Called by: PUT /api/bookings/{id}/approve
     *
     * @param id  The ID of the booking to approve
     * @return    The updated Booking with status = APPROVED
     * @throws RuntimeException if no booking found with the given id
     */
    public Booking approveBooking(Long id) {

        // STEP 1: Find the booking in the database.
        // If it does not exist, getBookingById() throws a RuntimeException automatically.
        Booking booking = getBookingById(id);

        // STEP 2: Update the status to APPROVED.
        // This means the admin has confirmed the resource is available for this slot.
        booking.setStatus(BookingStatus.APPROVED);

        // STEP 3: Save the updated booking.
        // JPA will run an UPDATE SQL statement (not INSERT, because the id already exists).
        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────
    // METHOD 6: REJECT BOOKING  [DAY 5 – NEW]
    // ─────────────────────────────────────────────

    /**
     * Rejects a booking by setting its status to REJECTED and storing the reason.
     *
     * Steps:
     *   1. Find the booking by id (throws exception if not found).
     *   2. Change the status from PENDING → REJECTED.
     *   3. Store the rejection reason provided by the admin.
     *   4. Save the updated booking back to the database.
     *   5. Return the updated booking.
     *
     * Called by: PUT /api/bookings/{id}/reject
     *
     * @param id     The ID of the booking to reject
     * @param reason The reason for rejection (e.g., "Resource unavailable")
     * @return       The updated Booking with status = REJECTED and the reason stored
     * @throws RuntimeException if no booking found with the given id
     */
    public Booking rejectBooking(Long id, String reason) {

        // STEP 1: Find the booking in the database.
        // If not found, getBookingById() throws RuntimeException → controller returns 404.
        Booking booking = getBookingById(id);

        // STEP 2: Update the status to REJECTED.
        // The admin has decided this booking cannot be accommodated.
        booking.setStatus(BookingStatus.REJECTED);

        // STEP 3: Store the rejection reason.
        // This is saved to the 'rejection_reason' column in the database.
        // The user can later read this to understand why their booking was refused.
        booking.setRejectionReason(reason);

        // STEP 4: Save and return the updated booking.
        return bookingRepository.save(booking);
    }
}
