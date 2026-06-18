package com.aisignapp.controller;

import com.aisignapp.dto.request.LoginRequest;
import com.aisignapp.dto.request.RegisterRequest;
import com.aisignapp.dto.response.AuthResponse;
import com.aisignapp.entity.Role;
import com.aisignapp.entity.User;
import com.aisignapp.repository.RoleRepository;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.security.JwtService;
import com.aisignapp.service.SmsService;
import com.aisignapp.service.TwoFactorAuthService;
import com.aisignapp.util.PhoneNumberFormatter;
import com.google.i18n.phonenumbers.NumberParseException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PhoneNumberFormatter phoneNumberFormatter;
    private final TwoFactorAuthService twoFactorAuthService;
    private final SmsService smsService;   // ← added for test endpoint

    // ── Login (now supports 2FA) ──
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.is2faEnabled()) {
            try {
                twoFactorAuthService.generateAndSendCode(user);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }

            String tempToken = jwtService.generateTempToken(userDetails);
            return ResponseEntity.ok(Map.of(
                    "requires2FA", true,
                    "tempToken", tempToken,
                    "maskedPhone", maskPhone(user.getPhoneNumber())
            ));
        }

        String token = jwtService.generateToken(userDetails);
        String role = user.getRole().getRoleName();
        return ResponseEntity.ok(new AuthResponse(token, "Bearer", user.getUserId(), user.getEmail(), role));
    }

    // ── Second factor verification ──
    @PostMapping("/login-2fa")
    public ResponseEntity<?> login2FA(@Valid @RequestBody Login2FARequest request) {
        String tempToken = request.getTempToken();
        String code = request.getCode();

        String username = jwtService.extractUsername(tempToken);
        if (username == null || !jwtService.validateToken(tempToken,
                org.springframework.security.core.userdetails.User.builder()
                        .username(username)
                        .password("")
                        .authorities("ROLE_TEMP")
                        .build())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired session"));
        }

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.is2faEnabled()) {
            return ResponseEntity.badRequest().body(Map.of("error", "2FA is not enabled for this account"));
        }

        if (!twoFactorAuthService.validateCode(user, code)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired code"));
        }

        twoFactorAuthService.clearCode(user);

        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .authorities("ROLE_" + user.getRole().getRoleName())
                        .build()
        );
        String role = user.getRole().getRoleName();

        return ResponseEntity.ok(new AuthResponse(token, "Bearer", user.getUserId(), user.getEmail(), role));
    }

    // ── Registration (unchanged) ──
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email already exists");
            return ResponseEntity.badRequest().body(error);
        }

        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Default role STUDENT not found. Please seed roles first."));

        String formattedPhone;
        try {
            formattedPhone = phoneNumberFormatter.formatToE164(request.getPhoneNumber(), "GH");
        } catch (NumberParseException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid phone number format. Use international format (e.g., +233501234567) or local number with default region.");
            return ResponseEntity.badRequest().body(error);
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(formattedPhone)
                .role(studentRole)
                .build();

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── SMS test endpoint (temporary) ──
    @GetMapping("/test-sms")
    public ResponseEntity<?> testSms() {
        try {
            smsService.sendSms("+23352011738", "Test message from PalmPulse");
            return ResponseEntity.ok("SMS sent");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("SMS failed: " + e.getMessage());
        }
    }

    // ── Helper to mask phone number ──
    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return "****" + phone.substring(phone.length() - 4);
    }
}

// ── DTO for 2FA request (public, top‑level) ──
@Data
class Login2FARequest {
    @NotBlank
    private String tempToken;
    @NotBlank
    private String code;
}