package com.aisignapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuizSubmissionResponse {
    private Long scoreId;
    private int score;
    private int total;
    private double percentage;
    private boolean passed;
    private String badgeAwarded; // "PLATINUM" or null
}