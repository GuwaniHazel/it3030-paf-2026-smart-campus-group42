package com.sliit.smart_campus.service;

import com.sliit.smart_campus.dto.NotificationDto;
import com.sliit.smart_campus.entity.*;
import com.sliit.smart_campus.repository.NotificationPreferenceRepository;
import com.sliit.smart_campus.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        notification = new Notification();
        notification.setId(1L);
        notification.setRecipient(user);
        notification.setTitle("Test Title");
        notification.setMessage("Test Message");
        notification.setType(NotificationType.GENERAL);
        notification.setStatus(NotificationStatus.UNREAD);
    }

    @Test
    void createNotification_ShouldSave_WhenPreferenceEnabled() {
        when(preferenceRepository.findByUserIdAndType(any(), any())).thenReturn(Optional.empty()); // Default is true
        when(notificationRepository.save(any())).thenReturn(notification);

        Notification result = notificationService.createNotification(user, "Title", "Msg", NotificationType.GENERAL, null);

        assertNotNull(result);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createNotification_ShouldNotSave_WhenPreferenceDisabled() {
        NotificationPreference pref = new NotificationPreference(user, NotificationType.GENERAL, false);
        when(preferenceRepository.findByUserIdAndType(any(), any())).thenReturn(Optional.of(pref));

        Notification result = notificationService.createNotification(user, "Title", "Msg", NotificationType.GENERAL, null);

        assertNull(result);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void getUserNotifications_ShouldReturnPage() {
        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(notificationRepository.findByRecipientId(anyLong(), any(Pageable.class))).thenReturn(page);

        Page<NotificationDto> result = notificationService.getUserNotifications(1L, Pageable.unpaged());

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Title", result.getContent().get(0).getTitle());
    }

    @Test
    void markAsRead_ShouldUpdateStatus_WhenAuthorized() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any())).thenReturn(notification);

        boolean success = notificationService.markAsRead(1L, 1L);

        assertTrue(success);
        assertEquals(NotificationStatus.READ, notification.getStatus());
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsRead_ShouldReturnFalse_WhenNotAuthorized() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        boolean success = notificationService.markAsRead(1L, 2L); // Different user

        assertFalse(success);
        assertEquals(NotificationStatus.UNREAD, notification.getStatus());
        verify(notificationRepository, never()).save(any());
    }
}
