package com.aisignapp.controller;

import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.TwoFactorAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/2fa")
@RequiredArgsConstructor
public class TwoFactorAuthController {

    private final TwoFactorAuthService twoFactorAuthService;
    private final UserRepository userRepository;

    @PostMapping("/enable")
    public ResponseEntity<?> enable(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        try {
            twoFactorAuthService.enable2FA(user);
            return ResponseEntity.ok(Map.of("message", "2FA enabled"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/disable")
    public ResponseEntity<?> disable(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        twoFactorAuthService.disable2FA(user);
        return ResponseEntity.ok(Map.of("message", "2FA disabled"));
    }
}