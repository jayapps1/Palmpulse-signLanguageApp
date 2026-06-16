package com.aisignapp.dto.request;

import com.aisignapp.entity.enums.DifficultyLevel;
import com.aisignapp.entity.enums.LessonStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank
    private String title;
    private String description;
    private DifficultyLevel difficultyLevel;
    private LessonStatus status;
}