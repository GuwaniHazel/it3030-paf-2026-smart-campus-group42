package backend.backend.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Booking Entity – Module B: Booking Management
 *
 * Maps to the 'bookings' table in the MySQL database.
 * Represents one booking request made by a user for a campus resource
 * (e.g., lecture hall, lab, meeting room, equipment).
 *
 * JPA annotations  → handle the database table mapping.
 * Lombok annotations → eliminate boilerplate code (getters, setters, constructors).
 *
 * Booking Lifecycle:
 *   PENDING → APPROVED → CANCELLED
 *   PENDING → REJECTED  (with rejectionReason)
 */
@Entity                         // Marks this class as a JPA-managed database entity
@Table(name = "bookings")       // Maps to the 'bookings' table in MySQL
@Data                           // Lombok: auto-generates getters, setters, toString, equals, hashCode
@NoArgsConstructor              // Lombok: generates a no-arg constructor (required by JPA)
@AllArgsConstructor             // Lombok: generates a constructor with all fields
@Builder                        // Lombok: enables the Builder pattern for creating objects cleanly
public class Booking {

    // ─────────────────────────────────────────────
    // PRIMARY KEY
    // ─────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment (1, 2, 3, …) in MySQL
    private Long id;

    // ─────────────────────────────────────────────
    // USER & RESOURCE REFERENCES
    // ─────────────────────────────────────────────

    @Column(name = "user_id", nullable = false)
    private Long userId;          // ID of the user who made this booking

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;      // ID of the campus resource being booked

    // ─────────────────────────────────────────────
    // BOOKING DATE & TIME
    // ─────────────────────────────────────────────

    @Column(name = "date", nullable = false)
    private LocalDate date;       // Date of the booking  (e.g., 2026-04-25)

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;  // Start time  (e.g., 09:00)

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;    // End time    (e.g., 11:00)

    // ─────────────────────────────────────────────
    // BOOKING DETAILS
    // ─────────────────────────────────────────────

    @Column(name = "purpose", nullable = false, length = 500)
    private String purpose;       // Reason for the booking (e.g., "Group study session")

    @Column(name = "attendees", nullable = false)
    private int attendees;        // Number of attendees (must be > 0)

    // ─────────────────────────────────────────────
    // STATUS & REJECTION
    // ─────────────────────────────────────────────

    @Enumerated(EnumType.STRING)            // Store as "PENDING", "APPROVED" etc. (not 0, 1, 2…)
    @Column(name = "status", nullable = false)
    private BookingStatus status;           // Current status of the booking

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;         // Filled by admin when status = REJECTED (nullable)

    // ─────────────────────────────────────────────
    // AUDIT FIELD
    // ─────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;        // Timestamp set once when first saved

    /**
     * @PrePersist – JPA calls this automatically just before the first INSERT.
     * This guarantees createdAt is always set, even if the caller forgets it.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
