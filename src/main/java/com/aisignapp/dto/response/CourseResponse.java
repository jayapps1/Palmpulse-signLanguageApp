package com.aisignapp.dto.response;

import com.aisignapp.entity.enums.DifficultyLevel;
import com.aisignapp.entity.enums.LessonStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private DifficultyLevel difficultyLevel;
    private LessonStatus status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}