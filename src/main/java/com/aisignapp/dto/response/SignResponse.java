package com.aisignapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SignResponse {
    private Long signId;
    private String signName;
    private String description;
    private String videoUrl;
    private String imageUrl;
    private Long createdBy;          // who created the sign (teacher or admin)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}