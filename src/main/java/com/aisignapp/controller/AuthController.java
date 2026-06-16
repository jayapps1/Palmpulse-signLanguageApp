package com.aisignapp.controller;

import com.aisignapp.dto.request.LoginRequest;
import com.aisignapp.dto.request.RegisterRequest;
import com.aisignapp.dto.response.AuthResponse;
import com.aisignapp.entity.Role;
import com.aisignapp.entity.User;
import com.aisignapp.repository.RoleRepository;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.security.JwtService;
import com.aisignapp.util.PhoneNumberFormatter;
import com.google.i18n.phonenumbers.NumberParseException;
import jakarta.validation.Valid;
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

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole().getRoleName();

        return ResponseEntity.ok(new AuthResponse(token, "Bearer", user.getUserId(), user.getEmail(), role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Check for existing email
        if (userRepository.existsByEmail(request.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email already exists");
            return ResponseEntity.badRequest().body(error);
        }

        // Get default STUDENT role
        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Default role STUDENT not found. Please seed roles first."));

        // Format phone number to E.164
        String formattedPhone;
        try {
            formattedPhone = phoneNumberFormatter.formatToE164(request.getPhoneNumber(), "GH");
        } catch (NumberParseException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid phone number format. Use international format (e.g., +233501234567) or local number with default region.");
            return ResponseEntity.badRequest().body(error);
        }

        // Build and save user
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
}