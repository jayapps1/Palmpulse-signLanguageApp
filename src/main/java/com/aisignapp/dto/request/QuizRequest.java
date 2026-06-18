package com.aisignapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuizRequest {
    @NotNull
    private Long lessonId;
    @NotBlank
    private String title;
    private Boolean isFinalQuiz = false;
    private Integer numberOfQuestions;
    private List<QuizQuestionRequest> questions;
}

