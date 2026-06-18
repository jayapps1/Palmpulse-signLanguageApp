package com.aisignapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class QuizResponse {
    private Long quizId;
    private Long lessonId;
    private String title;
    private Boolean isFinalQuiz;
    private Integer numberOfQuestions;
    private List<QuizQuestionResponse> questions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

