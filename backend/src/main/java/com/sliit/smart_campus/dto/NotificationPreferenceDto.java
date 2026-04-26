package com.sliit.smart_campus.dto;

import com.sliit.smart_campus.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDto {
    private NotificationType type;
    private boolean enabled;
}
