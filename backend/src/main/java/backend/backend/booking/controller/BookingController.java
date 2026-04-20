package backend.backend.booking.controller;

import backend.backend.booking.model.Booking;
import backend.backend.booking.model.BookingStatus;
import backend.backend.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * BookingController – Module B: Booking Management (Day 2 – Basic Version)
 *
 * This REST controller handles HTTP requests for bookings.
 * It is the entry point for all /api/bookings requests.
 *
 * current structure (Day 2 - temporary):
 *   HTTP Request → Controller → Repository → Database
 *
 * Future structure (Day 3+):
 *   HTTP Request → Controller → Service → Repository → Database
 *
 * NOTE: No business logic, validation, or conflict checking yet.
 *       These will be added in Day 3 via the Service layer.
 */
@RestController                     // Combines @Controller + @ResponseBody: returns JSON automatically
@RequestMapping("/api/bookings")    // All endpoints in this class start with /api/bookings
@CrossOrigin(origins = "*")         // Allows requests from any origin (useful during React frontend dev)
public class BookingController {

    // ─────────────────────────────────────────────
    // DEPENDENCY INJECTION
    // ─────────────────────────────────────────────

    private final BookingRepository bookingRepository;

    /**
     * Constructor injection (preferred over @Autowired on field).
     * Spring automatically provides the BookingRepository bean here.
     */
    @Autowired
    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 1: CREATE BOOKING
    // POST /api/bookings
    // ─────────────────────────────────────────────

    /**
     * Creates a new booking and saves it to the database.
     *
     * @RequestBody: Spring reads the JSON body from the HTTP request
     *               and automatically converts it into a Booking object.
     *
     * HTTP Method : POST
     * URL         : http://localhost:8080/api/bookings
     * Status Code : 201 Created (on success)
     *
     * Example Request Body (JSON):
     * {
     *   "userId": 1,
     *   "resourceId": 5,
     *   "date": "2026-04-25",
     *   "startTime": "09:00:00",
     *   "endTime": "11:00:00",
     *   "purpose": "Group study session",
     *   "attendees": 10,
     *   "status": "PENDING"
     * }
     */
    @PostMapping                            // Handles HTTP POST requests to /api/bookings
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {

        // Temporarily set status to PENDING if not provided in the request body.
        // In Day 3, this will be enforced in the Service layer.
        if (booking.getStatus() == null) {
            booking.setStatus(BookingStatus.PENDING);
        }

        // Save the booking to MySQL via JPA (also triggers @PrePersist → sets createdAt)
        Booking savedBooking = bookingRepository.save(booking);

        // Return the saved booking (with its generated id and createdAt) with HTTP 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBooking);
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 2: GET ALL BOOKINGS
    // GET /api/bookings
    // ─────────────────────────────────────────────

    /**
     * Retrieves all bookings from the database.
     *
     * HTTP Method : GET
     * URL         : http://localhost:8080/api/bookings
     * Status Code : 200 OK
     *
     * Use case    : Admin dashboard — view every booking in the system.
     */
    @GetMapping                             // Handles HTTP GET requests to /api/bookings
    public ResponseEntity<List<Booking>> getAllBookings() {

        // findAll() is provided by JpaRepository — no SQL needed
        List<Booking> bookings = bookingRepository.findAll();

        // Return the list with HTTP 200 OK
        return ResponseEntity.ok(bookings);
    }

    // ─────────────────────────────────────────────
    // ENDPOINT 3: GET BOOKING BY ID
    // GET /api/bookings/{id}
    // ─────────────────────────────────────────────

    /**
     * Retrieves a single booking by its ID.
     *
     * @PathVariable: Extracts the {id} from the URL (e.g., /api/bookings/3 → id = 3)
     *
     * HTTP Method : GET
     * URL         : http://localhost:8080/api/bookings/{id}
     * Status Code : 200 OK (found) | 404 Not Found (not found)
     *
     * Example     : GET http://localhost:8080/api/bookings/1
     */
    @GetMapping("/{id}")                        // Handles GET /api/bookings/{id}
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {

        // findById() returns an Optional<Booking> — it might or might not exist
        Optional<Booking> booking = bookingRepository.findById(id);

        if (booking.isPresent()) {
            // Booking found → return it with HTTP 200 OK
            return ResponseEntity.ok(booking.get());
        } else {
            // Booking not found → return HTTP 404 Not Found (no body needed)
            return ResponseEntity.notFound().build();
        }
    }
}
