package com.sliit.smart_campus.controller;

import com.sliit.smart_campus.dto.MarkNotificationReadRequest;
import com.sliit.smart_campus.dto.NotificationDto;
import com.sliit.smart_campus.dto.NotificationPreferenceDto;
import com.sliit.smart_campus.entity.NotificationType;
import com.sliit.smart_campus.entity.User;
import com.sliit.smart_campus.repository.UserRepository;
import com.sliit.smart_campus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<NotificationDto>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        User user = getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId(), pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Boolean>> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        boolean success = notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(Map.of("success", success));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(Authentication authentication) {
        User user = getCurrentUser(authentication);
        int marked = notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("marked", marked));
    }

    @GetMapping("/preferences")
    public ResponseEntity<List<NotificationPreferenceDto>> getPreferences(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(notificationService.getUserPreferences(user.getId()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<Map<String, Boolean>> updatePreference(
            @RequestBody NotificationPreferenceDto preferenceDto,
            Authentication authentication) {
        
        User user = getCurrentUser(authentication);
        boolean success = notificationService.updatePreference(user.getId(), user, preferenceDto.getType(), preferenceDto.isEnabled());
        return ResponseEntity.ok(Map.of("success", success));
    }

    private User getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
