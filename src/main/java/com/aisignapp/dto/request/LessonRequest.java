package com.aisignapp.dto.request;

import com.aisignapp.entity.enums.DifficultyLevel;
import com.aisignapp.entity.enums.LessonStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LessonRequest {
    @NotBlank
    private String title;
    private String description;
    private String content;
    private DifficultyLevel difficultyLevel;
    private LessonStatus status; // PUBLISHED, DRAFT, ARCHIVED (optional)
    private Long courseId;
}