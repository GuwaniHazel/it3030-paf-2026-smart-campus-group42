package backend.backend.booking.repository;

import backend.backend.booking.model.Booking;
import backend.backend.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByResourceIdAndDate(Long resourceId, LocalDate date);

    List<Booking> findByResourceIdAndDateAndStatus(Long resourceId, LocalDate date, BookingStatus status);

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceId(Long resourceId);

    List<Booking> findByStatus(BookingStatus status);
}
