package com.aisignapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class EnrollmentResponse {
    private Long enrollmentId;
    private String studentName;
    private String studentEmail;
    private String courseTitle;
    private String status;          // ACTIVE / COMPLETED
    private String badge;           // e.g., SILVER, GOLD, PLATINUM
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;
}