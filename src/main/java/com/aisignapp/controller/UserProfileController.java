package com.aisignapp.controller;

import com.aisignapp.dto.request.PasswordChangeRequest;
import com.aisignapp.dto.request.UpdateProfileRequest;
import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ───── existing profile endpoints ─────

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("userId", user.getUserId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("role", user.getRole().getRoleName());
        profile.put("profilePictureUrl", user.getProfilePictureUrl());
        profile.put("is2faEnabled", user.is2faEnabled());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("updatedAt", user.getUpdatedAt());

        return ResponseEntity.ok(profile);
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                           @Valid @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                            @Valid @RequestBody PasswordChangeRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            return ResponseEntity.badRequest().body("New password and confirmation do not match");
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect old password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("Password changed successfully");
    }

    // ───── NEW: profile picture upload ─────

    @PostMapping("/profile/picture")
    public ResponseEntity<?> uploadProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Basic validation
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        // Ensure the upload directory exists
        String uploadDir = "uploads/profile-pictures/";
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Create a unique file name
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String newFilename = UUID.randomUUID() + extension;

        // Save the file to disk
        try {
            Path filePath = Paths.get(uploadDir + newFilename);
            Files.write(filePath, file.getBytes());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save file"));
        }

        // Build the public URL (we'll serve /uploads/** as static resources)
        String fileUrl = "/uploads/profile-pictures/" + newFilename;

        // Update the user's profile picture URL in the database
        user.setProfilePictureUrl(fileUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("profilePictureUrl", fileUrl));
    }

    // ───── DEBUG: Check authorities of current token ─────
    @GetMapping("/debug/me")
    public ResponseEntity<?> debugMe(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "name", authentication.getName(),
                "authorities", authentication.getAuthorities()
        ));
    }
}