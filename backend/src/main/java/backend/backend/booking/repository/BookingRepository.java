package backend.backend.booking.repository;

import backend.backend.booking.model.Booking;
import backend.backend.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * BookingRepository – Module B: Booking Management
 *
 * Handles ALL database operations for the Booking entity.
 *
 * By extending JpaRepository, Spring Data JPA automatically provides:
 *   save()       → INSERT or UPDATE
 *   findById()   → SELECT by primary key
 *   findAll()    → SELECT all rows
 *   deleteById() → DELETE by primary key
 *
 * Custom query methods below are generated automatically from their
 * method names — no SQL or @Query annotations needed.
 *
 * JpaRepository<Booking, Long>
 *   → Booking = entity type
 *   → Long    = type of the primary key (id)
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ──────────────────────────────────────────────────────────────
    // QUERY 1: Find bookings by resource + date
    // SQL: SELECT * FROM bookings WHERE resource_id = ? AND date = ?
    // Use case: Conflict detection — find all bookings on the same slot
    // ──────────────────────────────────────────────────────────────
    List<Booking> findByResourceIdAndDate(Long resourceId, LocalDate date);

    // ──────────────────────────────────────────────────────────────
    // QUERY 2: Find bookings by resource + date + status
    // SQL: SELECT * FROM bookings WHERE resource_id = ? AND date = ? AND status = ?
    // Use case: Conflict detection — only check APPROVED bookings
    // ──────────────────────────────────────────────────────────────
    List<Booking> findByResourceIdAndDateAndStatus(Long resourceId, LocalDate date, BookingStatus status);

    // ──────────────────────────────────────────────────────────────
    // QUERY 3: Find all bookings for a specific user
    // SQL: SELECT * FROM bookings WHERE user_id = ?
    // Use case: "My Bookings" — a user views only their own bookings
    // ──────────────────────────────────────────────────────────────
    List<Booking> findByUserId(Long userId);

    // ──────────────────────────────────────────────────────────────
    // QUERY 4: Find all bookings for a specific resource
    // SQL: SELECT * FROM bookings WHERE resource_id = ?
    // Use case: Admin views all bookings for a particular room/lab
    // ──────────────────────────────────────────────────────────────
    List<Booking> findByResourceId(Long resourceId);

    // ──────────────────────────────────────────────────────────────
    // QUERY 5: Find all bookings with a specific status
    // SQL: SELECT * FROM bookings WHERE status = ?
    // Use case: Admin views all PENDING bookings awaiting approval
    // ──────────────────────────────────────────────────────────────
    List<Booking> findByStatus(BookingStatus status);
}
