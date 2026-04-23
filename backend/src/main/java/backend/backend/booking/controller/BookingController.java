package backend.backend.booking.controller;

import backend.backend.booking.dto.RejectRequest;
import backend.backend.booking.model.Booking;
import backend.backend.booking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * BookingController – Module B: Booking Management (Day 5 – Approve / Reject)
 *
 * The Controller's ONLY job is to:
 *   1. Receive the HTTP request.
 *   2. Pass data to the Service layer.
 *   3. Return the appropriate HTTP response.
 *
 * ALL business logic lives in BookingService – never here.
 *
 * Endpoints (Day 5 additions marked with [NEW]):
 *   POST   /api/bookings            → Create a new booking
 *   GET    /api/bookings            → Get all bookings
 *   GET    /api/bookings/{id}       → Get booking by ID
 *   PUT    /api/bookings/{id}/approve → Approve a booking  [NEW]
 *   PUT    /api/bookings/{id}/reject  → Reject a booking   [NEW]
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    // ─────────────────────────────────────────────
    // DEPENDENCY INJECTION
    // ─────────────────────────────────────────────

    private final BookingService bookingService;

    /**
     * Constructor injection – Spring provides the BookingService bean automatically.
     */
    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 1: CREATE BOOKING
    // POST /api/bookings
    // ─────────────────────────────────────────────

    /**
     * Creates a new booking.
     *
     * HTTP Method : POST
     * URL         : http://localhost:8080/api/bookings
     *
     * Success     : 201 Created     → returns the saved Booking as JSON
     * Failure     : 400 Bad Request → validation failed or conflict detected
     *
     * Example Request Body:
     * {
     *   "userId": 1,
     *   "resourceId": 5,
     *   "date": "2026-04-25",
     *   "startTime": "09:00:00",
     *   "endTime": "11:00:00",
     *   "purpose": "Group study session",
     *   "attendees": 10
     * }
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking savedBooking = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedBooking);

        } catch (IllegalArgumentException e) {
            // Validation or conflict error from the service → 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 2: GET ALL BOOKINGS
    // GET /api/bookings
    // ─────────────────────────────────────────────

    /**
     * Retrieves all bookings in the system.
     *
     * HTTP Method : GET
     * URL         : http://localhost:8080/api/bookings
     * Status Code : 200 OK
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 3: GET BOOKING BY ID
    // GET /api/bookings/{id}
    // ─────────────────────────────────────────────

    /**
     * Retrieves a single booking by its ID.
     *
     * HTTP Method : GET
     * URL         : http://localhost:8080/api/bookings/{id}
     *
     * Success     : 200 OK       → Booking JSON
     * Failure     : 404 Not Found → booking does not exist
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 4: APPROVE BOOKING  [DAY 5 – NEW]
    // PUT /api/bookings/{id}/approve
    // ─────────────────────────────────────────────

    /**
     * Approves a booking — sets its status to APPROVED.
     *
     * Only an admin should call this endpoint (security will be added later).
     *
     * HTTP Method : PUT
     * URL         : http://localhost:8080/api/bookings/{id}/approve
     *
     * No request body needed — just the booking ID in the URL path.
     *
     * Success     : 200 OK       → returns the updated Booking with status = APPROVED
     * Failure     : 404 Not Found → booking with the given ID does not exist
     *
     * Example:
     *   PUT http://localhost:8080/api/bookings/3/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        try {
            // Delegate to service – service finds the booking, sets APPROVED, and saves it.
            Booking updatedBooking = bookingService.approveBooking(id);

            // HTTP 200 OK – return the updated booking as JSON.
            return ResponseEntity.ok(updatedBooking);

        } catch (RuntimeException e) {
            // If the booking was not found, service throws RuntimeException → 404 Not Found.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 5: REJECT BOOKING  [DAY 5 – NEW]
    // PUT /api/bookings/{id}/reject
    // ─────────────────────────────────────────────

    /**
     * Rejects a booking — sets its status to REJECTED and stores the reason.
     *
     * HTTP Method : PUT
     * URL         : http://localhost:8080/api/bookings/{id}/reject
     *
     * Request Body (JSON):
     * {
     *   "reason": "Resource unavailable"
     * }
     *
     * @RequestBody RejectRequest → Spring reads the JSON body and maps it
     *   to the RejectRequest DTO automatically.
     *
     * Success     : 200 OK       → returns the updated Booking with status = REJECTED
     * Failure     : 404 Not Found → booking with the given ID does not exist
     *
     * Example:
     *   PUT http://localhost:8080/api/bookings/3/reject
     *   Body: { "reason": "Resource unavailable" }
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id,
                                           @RequestBody RejectRequest request) {
        try {
            // Pass the id and the reason string to the service.
            // The service handles finding the booking, setting REJECTED, storing the reason.
            Booking updatedBooking = bookingService.rejectBooking(id, request.getReason());

            // HTTP 200 OK – return the updated booking as JSON.
            return ResponseEntity.ok(updatedBooking);

        } catch (RuntimeException e) {
            // Booking not found → 404 Not Found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
