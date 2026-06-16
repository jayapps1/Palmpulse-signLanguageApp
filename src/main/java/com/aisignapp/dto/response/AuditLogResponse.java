package com.aisignapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuditLogResponse {
    private Long auditId;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String action;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}