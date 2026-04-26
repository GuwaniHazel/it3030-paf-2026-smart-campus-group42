package com.sliit.smart_campus.dto;

import com.sliit.smart_campus.entity.NotificationStatus;
import com.sliit.smart_campus.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private String link;
    private NotificationStatus status;
    private LocalDateTime createdAt;
}
