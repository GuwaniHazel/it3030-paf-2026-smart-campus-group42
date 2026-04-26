package com.sliit.smart_campus.repository;

import com.sliit.smart_campus.entity.Notification;
import com.sliit.smart_campus.entity.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);

    List<Notification> findByRecipientIdAndStatus(Long recipientId, NotificationStatus status);

    long countByRecipientIdAndStatus(Long recipientId, NotificationStatus status);

    @Modifying
    @Query("UPDATE Notification n SET n.status = ?2 WHERE n.id = ?1")
    int updateStatusById(Long id, NotificationStatus status);

    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ' WHERE n.recipient.id = ?1 AND n.status = 'UNREAD'")
    int markAllAsReadByRecipientId(Long recipientId);
}
