package com.aisignapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIQueryRequest {
    @NotBlank
    private String question;
}