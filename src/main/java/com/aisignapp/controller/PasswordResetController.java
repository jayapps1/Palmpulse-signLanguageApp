package com.aisignapp.controller;

import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.security.JwtService;
import com.aisignapp.service.TwoFactorAuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final TwoFactorAuthService twoFactorAuthService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Step 1 – Send 2FA code
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber()).orElse(null);
        // Always return success to prevent user enumeration
        if (user == null) {
            return ResponseEntity.ok(Map.of("message", "If the phone number exists, a code has been sent."));
        }
        try {
            twoFactorAuthService.generateAndSendCode(user);
        } catch (RuntimeException e) {
            // Log and still return success
        }
        return ResponseEntity.ok(Map.of("message", "If the phone number exists, a code has been sent."));
    }

    // Step 2 – Verify code and get a temporary token
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new RuntimeException("Invalid phone number"));

        if (!twoFactorAuthService.validateCode(user, request.getCode())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired code"));
        }
        twoFactorAuthService.clearCode(user);

        // Issue a temporary token valid for 5 minutes
        String tempToken = jwtService.generateTempToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password("")
                        .authorities("ROLE_TEMP")
                        .build()
        );
        return ResponseEntity.ok(Map.of("tempToken", tempToken));
    }

    // Step 3 – Reset password using the temporary token
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String username = jwtService.extractUsername(request.getTempToken());
        if (username == null || !jwtService.validateToken(request.getTempToken(),
                org.springframework.security.core.userdetails.User.builder()
                        .username(username)
                        .password("")
                        .authorities("ROLE_TEMP")
                        .build())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired session"));
        }

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
    }

    // ── DTOs ──
    @Data
    static class ForgotPasswordRequest {
        @NotBlank
        private String phoneNumber;
    }

    @Data
    static class VerifyCodeRequest {
        @NotBlank
        private String phoneNumber;
        @NotBlank
        private String code;
    }

    @Data
    static class ResetPasswordRequest {
        @NotBlank
        private String tempToken;
        @NotBlank @Size(min = 6)
        private String newPassword;
    }
}