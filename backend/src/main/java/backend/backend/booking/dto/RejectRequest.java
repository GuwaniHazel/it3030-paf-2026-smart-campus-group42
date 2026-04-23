package backend.backend.booking.dto;

/**
 * RejectRequest DTO – Module B: Booking Management (Day 5)
 *
 * WHAT IS A DTO?
 * ─────────────────────────────────────────────────────────
 * DTO = Data Transfer Object.
 * It is a simple class used ONLY to carry data between layers.
 *
 * WHY DO WE NEED THIS?
 * ─────────────────────────────────────────────────────────
 * When an admin rejects a booking, the request body looks like:
 *   { "reason": "Resource unavailable" }
 *
 * We cannot use the Booking entity to receive this data because:
 *   - The Booking entity maps to the database table.
 *   - We should never expose internal entity structure directly.
 *   - A DTO keeps the API contract clean and independent.
 *
 * Usage:
 *   @RequestBody RejectRequest request → Spring automatically
 *   deserialises the JSON body into this object.
 */
public class RejectRequest {

    // The rejection reason provided by the admin.
    // Example: "Resource unavailable" or "Time slot reserved for maintenance"
    private String reason;

    // ── No-arg constructor (required by Jackson for JSON deserialisation) ──
    public RejectRequest() {}

    // ── Constructor with argument (convenient for testing) ────────────────
    public RejectRequest(String reason) {
        this.reason = reason;
    }

    // ── Getter – Spring uses this to read the 'reason' field from JSON ────
    public String getReason() {
        return reason;
    }

    // ── Setter – Spring uses this to populate the 'reason' field from JSON ─
    public void setReason(String reason) {
        this.reason = reason;
    }
}
