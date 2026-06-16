package com.aisignapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CommentResponse {
    private Long commentId;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long targetId;
    private String targetType;   // "LESSON" or "TRANSLATION"
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}