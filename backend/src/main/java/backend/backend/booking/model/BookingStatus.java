package backend.backend.booking.model;

/**
 * BookingStatus Enum – Module B: Booking Management
 *
 * Represents every possible state in the booking lifecycle.
 *
 * Full lifecycle:
 *   User submits → PENDING
 *   Admin approves → APPROVED
 *   Admin rejects  → REJECTED  (rejectionReason is stored)
 *   User cancels   → CANCELLED (allowed from PENDING or APPROVED)
 */
public enum BookingStatus {

    /** Booking submitted by user, waiting for admin review. */
    PENDING,

    /** Admin has confirmed the booking. Resource is reserved. */
    APPROVED,

    /** Admin has refused the booking. A rejectionReason must be stored. */
    REJECTED,

    /** User cancelled their own booking. */
    CANCELLED
}
