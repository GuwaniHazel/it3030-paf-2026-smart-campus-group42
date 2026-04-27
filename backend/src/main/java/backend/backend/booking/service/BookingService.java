package backend.backend.booking.service;

import backend.backend.booking.model.Booking;
import backend.backend.booking.model.BookingStatus;
import backend.backend.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    @Autowired
    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Booking createBooking(Booking booking) {
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required.");
        }

        if (!booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new IllegalArgumentException(
                "Start time must be before end time. " +
                "Received: startTime=" + booking.getStartTime() +
                ", endTime=" + booking.getEndTime()
            );
        }

        if (booking.getAttendees() <= 0) {
            throw new IllegalArgumentException(
                "Number of attendees must be greater than 0. " +
                "Received: " + booking.getAttendees()
            );
        }

        if (booking.getDate() == null) {
            throw new IllegalArgumentException("Booking date is required.");
        }

        if (booking.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                "Booking date cannot be in the past. " +
                "Received: " + booking.getDate()
            );
        }

        if (hasConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime())) {
            throw new IllegalArgumentException(
                "Booking conflict detected for selected time range"
            );
        }

        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                    "Booking not found with id: " + id
                ));
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking approveBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() == BookingStatus.REJECTED ||
            booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException(
                "Cannot cancel a booking with status: " + booking.getStatus() +
                ". Only PENDING or APPROVED bookings can be cancelled."
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public boolean hasConflict(Long resourceId, LocalDate date,
                               LocalTime startTime, LocalTime endTime) {
        List<Booking> approvedBookings = bookingRepository
                .findByResourceIdAndDateAndStatus(resourceId, date, BookingStatus.APPROVED);

        for (Booking existing : approvedBookings) {
            boolean overlaps =
                    startTime.isBefore(existing.getEndTime())
                 && endTime.isAfter(existing.getStartTime());

            if (overlaps) {
                return true;
            }
        }

        return false;
    }
}
