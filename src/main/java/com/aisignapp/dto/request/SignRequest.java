package com.aisignapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignRequest {
    @NotBlank
    private String signName;
    private String description;
    private String videoUrl;
    private String imageUrl;
}