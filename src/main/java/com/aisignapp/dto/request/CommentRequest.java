package com.aisignapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentRequest {
    @NotNull
    private Long targetId;          // lessonId or transId

    @NotBlank
    private String targetType;      // "LESSON" or "TRANSLATION"

    @NotBlank
    private String content;
}