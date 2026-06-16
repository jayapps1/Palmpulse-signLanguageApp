package com.aisignapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AIQueryResponse {
    private String answer;
    private Long interactionId;
}