package backend.backend.booking.model;

/**
 * BookingStatus Enum – Module B: Booking Management
 *
 * Represents the lifecycle of a booking request.
 *
 * Flow:
 *   PENDING  →  APPROVED  →  CANCELLED (by user)
 *   PENDING  →  REJECTED  (by admin, with a reason)
 *
 * Used in the Booking entity as the 'status' field.
 */
public enum BookingStatus {

    /**
     * Initial state when a user submits a booking request.
     * Waiting for admin review.
     */
    PENDING,

    /**
     * Admin has approved the booking.
     * The resource is now reserved for that time slot.
     */
    APPROVED,

    /**
     * Admin has rejected the booking.
     * A rejectionReason must be provided by the admin.
     */
    REJECTED,

    /**
     * The booking was cancelled by the user (only allowed for PENDING or APPROVED bookings).
     */
    CANCELLED
}
