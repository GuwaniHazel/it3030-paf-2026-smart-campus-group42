package backend.backend.booking.controller;

import backend.backend.booking.model.Booking;
import backend.backend.booking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * BookingController – Module B: Booking Management (Day 3 – Service Layer)
 *
 * WHY IS THE CONTROLLER NOW THIN?
 * ─────────────────────────────────────────────────────
 * The Controller's ONLY job is to:
 *   1. Receive the HTTP request.
 *   2. Pass the data to the Service layer.
 *   3. Return the appropriate HTTP response.
 *
 * ALL business logic (validation, rules) lives in BookingService.
 * The Controller does NOT know HOW the booking is saved — it just delegates.
 *
 * Clean Architecture Flow (Day 3):
 *   HTTP Request → Controller → Service → Repository → Database
 * ─────────────────────────────────────────────────────
 *
 * @RestController  — Returns JSON automatically for every method.
 * @RequestMapping  — Base URL prefix for all endpoints in this class.
 * @CrossOrigin     — Allows the React frontend (different port) to call this API.
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    // ─────────────────────────────────────────────
    // DEPENDENCY INJECTION
    // ─────────────────────────────────────────────

    // We now depend on BookingService, NOT BookingRepository.
    // The Controller should never reach past the Service layer.
    private final BookingService bookingService;

    /**
     * Constructor injection — Spring provides the BookingService bean automatically.
     * This makes the controller easy to unit-test by passing a mock service.
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
     * The controller receives the JSON body and passes it directly
     * to the service. Validation happens inside the service — not here.
     *
     * HTTP Method : POST
     * URL         : http://localhost:8080/api/bookings
     *
     * Success     : 201 Created  → returns the saved Booking as JSON
     * Failure     : 400 Bad Request → if validation fails (e.g., bad times)
     *
     * Example Request Body (JSON):
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
            // Delegate ALL logic to the service layer.
            // The service validates and saves — the controller just returns the result.
            Booking savedBooking = bookingService.createBooking(booking);

            // HTTP 201 Created — booking was successfully saved.
            return ResponseEntity.status(HttpStatus.CREATED).body(savedBooking);

        } catch (IllegalArgumentException e) {
            // IllegalArgumentException is thrown by the service when validation fails.
            // Return HTTP 400 Bad Request with the error message so the client knows what went wrong.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 2: GET ALL BOOKINGS
    // GET /api/bookings
    // ─────────────────────────────────────────────

    /**
     * Retrieves all bookings.
     *
     * HTTP Method : GET
     * URL         : http://localhost:8080/api/bookings
     * Status Code : 200 OK
     *
     * Use case    : Admin dashboard — view every booking in the system.
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        // Delegate to service — controller does not call the repository directly.
        List<Booking> bookings = bookingService.getAllBookings();

        // HTTP 200 OK with the list of bookings as JSON.
        return ResponseEntity.ok(bookings);
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 3: GET BOOKING BY ID
    // GET /api/bookings/{id}
    // ─────────────────────────────────────────────

    /**
     * Retrieves a single booking by its ID.
     *
     * @PathVariable extracts the {id} value from the URL path.
     * Example: GET /api/bookings/3 → id = 3
     *
     * HTTP Method : GET
     * URL         : http://localhost:8080/api/bookings/{id}
     *
     * Success     : 200 OK       → returns the Booking as JSON
     * Failure     : 404 Not Found → if no booking exists with that id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            // Service finds the booking or throws RuntimeException if not found.
            Booking booking = bookingService.getBookingById(id);

            // HTTP 200 OK — booking found and returned.
            return ResponseEntity.ok(booking);

        } catch (RuntimeException e) {
            // RuntimeException is thrown by the service when the booking does not exist.
            // Return HTTP 404 Not Found with the error message.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
