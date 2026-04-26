package com.sliit.smart_campus.service;

import com.sliit.smart_campus.dto.NotificationDto;
import com.sliit.smart_campus.dto.NotificationPreferenceDto;
import com.sliit.smart_campus.entity.*;
import com.sliit.smart_campus.repository.NotificationPreferenceRepository;
import com.sliit.smart_campus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    @Transactional
    public Notification createNotification(User recipient, String title, String message, NotificationType type, String link) {
        if (!shouldNotifyUser(recipient.getId(), type)) {
            return null;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);
        notification.setStatus(NotificationStatus.UNREAD);

        return notificationRepository.save(notification);
    }

    public Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByRecipientId(userId, pageable)
                .map(this::mapToDto);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    @Transactional
    public boolean markAsRead(Long notificationId, Long currentUserId) {
        return notificationRepository.findById(notificationId)
                .filter(n -> n.getRecipient().getId().equals(currentUserId))
                .map(n -> {
                    n.setStatus(NotificationStatus.READ);
                    notificationRepository.save(n);
                    return true;
                }).orElse(false);
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsReadByRecipientId(userId);
    }

    public List<NotificationPreferenceDto> getUserPreferences(Long userId) {
        List<NotificationPreference> preferences = preferenceRepository.findByUserId(userId);
        
        // Ensure all types are represented, even if not in DB yet
        return Arrays.stream(NotificationType.values())
                .map(type -> {
                    boolean enabled = preferences.stream()
                            .filter(p -> p.getType() == type)
                            .map(NotificationPreference::isEnabled)
                            .findFirst()
                            .orElse(true); // Default to true
                    return new NotificationPreferenceDto(type, enabled);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean updatePreference(Long userId, User user, NotificationType type, boolean enabled) {
        NotificationPreference preference = preferenceRepository.findByUserIdAndType(userId, type)
                .orElseGet(() -> new NotificationPreference(user, type, true));
        
        preference.setEnabled(enabled);
        preference.setUser(user); // Ensure user is set if newly created
        preferenceRepository.save(preference);
        return true;
    }

    public boolean shouldNotifyUser(Long userId, NotificationType type) {
        return preferenceRepository.findByUserIdAndType(userId, type)
                .map(NotificationPreference::isEnabled)
                .orElse(true); // Default to true if no preference set
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .link(notification.getLink())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
