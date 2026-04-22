package backend.backend.booking.service;

import backend.backend.booking.model.Booking;
import backend.backend.booking.model.BookingStatus;
import backend.backend.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * BookingService – Module B: Booking Management (Day 3)
 *
 * WHY DO WE NEED A SERVICE LAYER?
 * ─────────────────────────────────────────────────────
 * In Day 2, the Controller talked directly to the Repository:
 *   Controller → Repository → Database
 *
 * This is problematic because:
 *   1. Business logic (validation, rules) ends up mixed with HTTP handling.
 *   2. The Controller becomes bloated and hard to test/maintain.
 *   3. Code cannot be reused — if another class needs to create a booking,
 *      it would have to duplicate the logic.
 *
 * The Service layer fixes this by:
 *   - Keeping the Controller thin (only handles HTTP concerns).
 *   - Centralising ALL business logic here.
 *   - Making the code easier to test (unit-test the service independently).
 *
 * Clean Architecture Flow (Day 3+):
 *   HTTP Request → Controller → Service → Repository → Database
 * ─────────────────────────────────────────────────────
 *
 * @Service — marks this class as a Spring-managed service bean.
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
     * Constructor injection — the recommended way to inject dependencies in Spring.
     * Spring automatically provides the BookingRepository bean when creating this service.
     *
     * Constructor injection is preferred over @Autowired on fields because:
     *   - It makes dependencies explicit and visible.
     *   - It allows the class to be easily unit-tested without Spring context.
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
     *   3. Status is always set to PENDING on creation (the user cannot set it themselves).
     *
     * @param booking  The Booking object received from the controller
     * @return         The saved Booking (with generated id and createdAt timestamp)
     * @throws IllegalArgumentException if validation fails
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
        // A booking must have at least 1 attendee — 0 or negative makes no sense.
        if (booking.getAttendees() <= 0) {
            throw new IllegalArgumentException(
                "Number of attendees must be greater than 0. " +
                "Received: " + booking.getAttendees()
            );
        }

        // ── BUSINESS RULE: Force status to PENDING ───────────────────────
        // Regardless of what the client sends, every new booking starts as PENDING.
        // Only an admin can change the status later (Day 4+ – approval logic).
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
     * No business logic needed here — just delegate to the repository.
     * Having this in the service (rather than calling the repo directly from
     * the controller) keeps the architecture clean and consistent.
     *
     * @return List of all Booking records (empty list if none exist)
     */
    public List<Booking> getAllBookings() {
        // findAll() is provided by JpaRepository — Spring Data generates the SQL.
        return bookingRepository.findAll();
    }

    // ─────────────────────────────────────────────
    // METHOD 3: GET BOOKING BY ID
    // ─────────────────────────────────────────────

    /**
     * Retrieves a single booking by its primary key (id).
     *
     * Exception Handling:
     *   If no booking with the given id exists in the database,
     *   we throw a RuntimeException with a descriptive message.
     *
     *   This is caught by the Controller, which then returns an
     *   appropriate HTTP response (e.g., 404 Not Found).
     *
     * @param id  The primary key of the booking to retrieve
     * @return    The Booking object if found
     * @throws RuntimeException if no booking found with the given id
     */
    public Booking getBookingById(Long id) {
        // findById() returns Optional<Booking> — it may or may not contain a value.
        // orElseThrow() unwraps the Optional:
        //   → If present: returns the Booking.
        //   → If empty:   throws the RuntimeException with our custom message.
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                    "Booking not found with id: " + id
                ));
    }
}
