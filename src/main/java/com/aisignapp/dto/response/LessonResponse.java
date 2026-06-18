package com.aisignapp.dto.response;

import com.aisignapp.entity.enums.DifficultyLevel;
import com.aisignapp.entity.enums.LessonStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LessonResponse {
    private Long lessonId;
    private Long courseId;
    private String title;
    private String description;
    private String content;
    private DifficultyLevel difficultyLevel;
    private LessonStatus status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}