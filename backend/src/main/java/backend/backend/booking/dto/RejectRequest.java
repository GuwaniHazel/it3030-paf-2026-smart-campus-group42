package backend.backend.booking.dto;

/**
 * RejectRequest DTO – Module B: Booking Management
 *
 * DTO = Data Transfer Object.
 * A simple class used ONLY to carry the rejection reason
 * from the HTTP request body into the service layer.
 *
 * When an admin rejects a booking, the JSON body looks like:
 *   { "reason": "Resource unavailable" }
 *
 * Spring automatically maps that JSON → this object via @RequestBody.
 */
public class RejectRequest {

    // The rejection reason written by the admin.
    private String reason;

    // No-arg constructor — required by Jackson (JSON library) to deserialise
    public RejectRequest() {}

    // Constructor with argument — useful for testing
    public RejectRequest(String reason) {
        this.reason = reason;
    }

    // Getter — Spring reads this to access the 'reason' value
    public String getReason() {
        return reason;
    }

    // Setter — Spring uses this to populate 'reason' from the JSON body
    public void setReason(String reason) {
        this.reason = reason;
    }
}
