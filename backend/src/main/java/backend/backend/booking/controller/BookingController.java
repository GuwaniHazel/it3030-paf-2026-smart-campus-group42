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
 * BookingController – Module B: Booking Management (Complete – Day 1 to Day 6)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The Controller's ONLY responsibility:
 *   1. Receive the HTTP request.
 *   2. Pass data to the Service layer.
 *   3. Return the appropriate HTTP response.
 *
 * ALL business logic lives in BookingService — never here.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Endpoints:
 *   POST   /api/bookings              → Create a new booking
 *   GET    /api/bookings              → Get all bookings         (admin)
 *   GET    /api/bookings/{id}         → Get booking by ID
 *   GET    /api/bookings/user/{userId}→ Get bookings for a user  (my bookings)
 *   PUT    /api/bookings/{id}/approve → Admin approves booking
 *   PUT    /api/bookings/{id}/reject  → Admin rejects booking
 *   PUT    /api/bookings/{id}/cancel  → User cancels booking
 *
 * @RestController – every method returns JSON automatically.
 * @RequestMapping – base URL prefix for all endpoints.
 * @CrossOrigin    – allows the React frontend (different port) to call this API.
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
     * Constructor injection — Spring provides BookingService automatically.
     * Keeps the controller easy to unit-test (pass a mock service).
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
     * Creates a new booking request.
     *
     * HTTP Method : POST
     * URL         : http://localhost:8080/api/bookings
     *
     * Success     : 201 Created     → saved Booking JSON (status = PENDING)
     * Failure     : 400 Bad Request → validation error or conflict message
     *
     * Sample Request Body:
     * {
     *   "userId": 1,
     *   "resourceId": 5,
     *   "date": "2026-04-30",
     *   "startTime": "09:00:00",
     *   "endTime": "11:00:00",
     *   "purpose": "Group study session",
     *   "attendees": 10
     * }
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking saved = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (IllegalArgumentException e) {
            // Validation failed or conflict detected → 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 2: GET ALL BOOKINGS  (Admin)
    // GET /api/bookings
    // ─────────────────────────────────────────────

    /**
     * Returns all bookings in the system.
     * Intended for the admin dashboard.
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
     * Returns a single booking by its ID.
     *
     * @PathVariable extracts the {id} from the URL.
     * Example: GET /api/bookings/3 → id = 3
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
    // ENDPOINT 4: GET BOOKINGS FOR A USER  ("My Bookings")
    // GET /api/bookings/user/{userId}
    // ─────────────────────────────────────────────

    /**
     * Returns all bookings belonging to a specific user.
     * This is the "My Bookings" feature — a user can view their own history.
     *
     * HTTP Method : GET
     * URL         : http://localhost:8080/api/bookings/user/{userId}
     * Example     : GET /api/bookings/user/1 → all bookings for user with id=1
     *
     * Status Code : 200 OK (returns empty list if user has no bookings)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) {
        List<Booking> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 5: APPROVE BOOKING  (Admin action)
    // PUT /api/bookings/{id}/approve
    // ─────────────────────────────────────────────

    /**
     * Admin approves a booking — sets status to APPROVED.
     *
     * HTTP Method : PUT
     * URL         : http://localhost:8080/api/bookings/{id}/approve
     * Body        : None (just the booking ID in the URL is enough)
     *
     * Success     : 200 OK       → Updated Booking JSON (status = APPROVED)
     * Failure     : 404 Not Found → booking does not exist
     *
     * Example: PUT http://localhost:8080/api/bookings/3/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        try {
            Booking updated = bookingService.approveBooking(id);
            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 6: REJECT BOOKING  (Admin action)
    // PUT /api/bookings/{id}/reject
    // ─────────────────────────────────────────────

    /**
     * Admin rejects a booking — sets status to REJECTED and stores the reason.
     *
     * HTTP Method : PUT
     * URL         : http://localhost:8080/api/bookings/{id}/reject
     *
     * Request Body (JSON):
     * {
     *   "reason": "Resource unavailable"
     * }
     *
     * @RequestBody RejectRequest → Spring maps the JSON body to the DTO automatically.
     *
     * Success     : 200 OK       → Updated Booking JSON (status = REJECTED, reason stored)
     * Failure     : 404 Not Found → booking does not exist
     *
     * Example: PUT http://localhost:8080/api/bookings/3/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id,
                                           @RequestBody RejectRequest request) {
        try {
            Booking updated = bookingService.rejectBooking(id, request.getReason());
            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 7: CANCEL BOOKING  (User action)
    // PUT /api/bookings/{id}/cancel
    // ─────────────────────────────────────────────

    /**
     * User cancels their own booking — sets status to CANCELLED.
     *
     * Only PENDING or APPROVED bookings can be cancelled.
     * A REJECTED or already-CANCELLED booking cannot be cancelled again.
     *
     * HTTP Method : PUT
     * URL         : http://localhost:8080/api/bookings/{id}/cancel
     * Body        : None (just the booking ID in the URL)
     *
     * Success     : 200 OK       → Updated Booking JSON (status = CANCELLED)
     * Failure     : 404 Not Found → booking does not exist
     * Failure     : 400 Bad Request → booking cannot be cancelled (wrong status)
     *
     * Example: PUT http://localhost:8080/api/bookings/3/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            Booking updated = bookingService.cancelBooking(id);
            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            // Booking not found → 404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());

        } catch (IllegalStateException e) {
            // Cannot cancel (wrong status) → 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
