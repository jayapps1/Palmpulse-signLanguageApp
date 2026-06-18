package com.aisignapp.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Map;

@Data
public class QuizSubmissionRequest {
    @NotNull
    private Long quizId;
    private Map<Long, String> answers; // questionId -> selected answer (text)
}