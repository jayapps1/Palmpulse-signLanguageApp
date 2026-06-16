package com.aisignapp.dto.request;

import com.aisignapp.validation.ValidPhoneNumber;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;

    @ValidPhoneNumber
    private String phoneNumber;

    private String profilePictureUrl;


}