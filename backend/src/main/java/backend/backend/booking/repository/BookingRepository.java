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
 * This interface handles ALL database operations for the Booking entity.
 *
 * By extending JpaRepository, Spring Data JPA automatically provides:
 *   - save()        → INSERT or UPDATE a booking
 *   - findById()    → SELECT by primary key (id)
 *   - findAll()     → SELECT all bookings
 *   - deleteById()  → DELETE by primary key
 *   - count()       → COUNT all rows
 *   ... and more — all without writing any SQL!
 *
 * JpaRepository<Booking, Long>
 *   → Booking = the entity type this repository manages
 *   → Long    = the data type of the primary key (id field)
 */
@Repository  // Marks this as a Spring-managed repository bean (also enables exception translation)
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Custom Query Method 1: Find bookings by resource and date.
     *
     * Spring Data JPA automatically generates the SQL for this method
     * by reading the method name. No @Query annotation needed!
     *
     * Generated SQL (roughly):
     *   SELECT * FROM bookings WHERE resource_id = ? AND date = ?
     *
     * Use case (Day 3+):
     *   Used during conflict detection — find all existing bookings
     *   for a given resource on a given date, then check for time overlaps.
     *
     * @param resourceId  The ID of the campus resource (e.g., room ID)
     * @param date        The date to check (e.g., 2026-04-20)
     * @return            List of bookings for that resource on that date
     */
    List<Booking> findByResourceIdAndDate(Long resourceId, LocalDate date);

    /**
     * Custom Query Method 2: Find all bookings belonging to a specific user.
     *
     * Generated SQL (roughly):
     *   SELECT * FROM bookings WHERE user_id = ?
     *
     * Use case: "My Bookings" page — a user can view only their own bookings.
     *
     * @param userId  The ID of the user
     * @return        List of bookings made by that user
     */
    List<Booking> findByUserId(Long userId);

    /**
     * Custom Query Method 3: Find bookings for a resource, date, AND specific status.
     *
     * Generated SQL (roughly):
     *   SELECT * FROM bookings WHERE resource_id = ? AND date = ? AND status = ?
     *
     * Use case (Day 3+):
     *   When checking conflicts, we ONLY check against APPROVED bookings.
     *   A PENDING or REJECTED booking does NOT block the time slot.
     *
     * @param resourceId  The resource to check
     * @param date        The date to check
     * @param status      The booking status to filter by (pass BookingStatus.APPROVED)
     * @return            List of APPROVED bookings for that resource on that date
     */
    List<Booking> findByResourceIdAndDateAndStatus(Long resourceId, LocalDate date, BookingStatus status);
}
