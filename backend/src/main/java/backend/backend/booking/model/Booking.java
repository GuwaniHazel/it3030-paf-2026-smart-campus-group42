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
 * Represents a single booking request made by a user for a campus resource.
 *
 * JPA annotations handle the database mapping.
 * Lombok annotations eliminate boilerplate (getters, setters, constructors).
 */
@Entity                         // Marks this class as a JPA entity (maps to a DB table)
@Table(name = "bookings")       // Specifies the exact table name in MySQL
@Data                           // Lombok: generates getters, setters, toString, equals, hashCode
@NoArgsConstructor              // Lombok: generates a no-arg constructor (required by JPA)
@AllArgsConstructor             // Lombok: generates a constructor with all fields
@Builder                        // Lombok: enables the Builder pattern for clean object creation
public class Booking {

    // ─────────────────────────────────────────────
    // PRIMARY KEY
    // ─────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment in MySQL
    private Long id;                                     // Unique booking ID

    // ─────────────────────────────────────────────
    // USER & RESOURCE REFERENCES
    // ─────────────────────────────────────────────

    @Column(name = "user_id", nullable = false)
    private Long userId;          // ID of the user who created this booking

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;      // ID of the campus resource being booked (e.g., room, lab)

    // ─────────────────────────────────────────────
    // BOOKING DATE & TIME
    // ─────────────────────────────────────────────

    @Column(name = "date", nullable = false)
    private LocalDate date;       // Date of the booking (e.g., 2026-04-20)

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;  // Start time of the booking (e.g., 09:00)

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;    // End time of the booking (e.g., 11:00)

    // ─────────────────────────────────────────────
    // BOOKING DETAILS
    // ─────────────────────────────────────────────

    @Column(name = "purpose", nullable = false, length = 500)
    private String purpose;       // Reason for booking (e.g., "Group study session")

    @Column(name = "attendees", nullable = false)
    private int attendees;        // Number of people attending (must be > 0)

    // ─────────────────────────────────────────────
    // STATUS & REJECTION
    // ─────────────────────────────────────────────

    @Enumerated(EnumType.STRING)         // Store enum as String in DB (e.g., "PENDING"), not as index number
    @Column(name = "status", nullable = false)
    private BookingStatus status;        // Current status: PENDING, APPROVED, REJECTED, CANCELLED

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;      // Filled by admin only when status = REJECTED (nullable)

    // ─────────────────────────────────────────────
    // AUDIT FIELD
    // ─────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;     // Timestamp when the booking was first created

    /**
     * Automatically set createdAt before the entity is first saved to the database.
     * This ensures we never forget to set it manually.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
