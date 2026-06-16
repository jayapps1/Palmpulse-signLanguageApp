package com.aisignapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class EnrollmentResponse {
    private Long enrollmentId;
    private Long teacherId;
    private String teacherName;
    private String status;
    private LocalDateTime enrollmentDate;
}
