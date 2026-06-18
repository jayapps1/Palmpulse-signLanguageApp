package com.aisignapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuizQuestionRequest {
    @NotBlank
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    @NotBlank
    private String correctAnswer;
}
