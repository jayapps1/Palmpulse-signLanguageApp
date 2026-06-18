package com.aisignapp.controller;

import com.aisignapp.dto.request.SignRequest;
import com.aisignapp.dto.response.SignResponse;
import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.SignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SignController {

    private final SignService signService;
    private final UserRepository userRepository;

    // Upload video/image file for a sign (before linking to a sign record)
    @PostMapping("/api/signs/upload")
    public ResponseEntity<?> uploadSignFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,   // "video" or "image"
            @AuthenticationPrincipal UserDetails userDetails) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        String contentType = file.getContentType();
        if (type.equals("video") && (contentType == null || !contentType.startsWith("video/"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only video files are allowed for type=video"));
        }
        if (type.equals("image") && (contentType == null || !contentType.startsWith("image/"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed for type=image"));
        }

        String uploadDir = type.equals("video") ? "uploads/sign-videos/" : "uploads/sign-images/";
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : (type.equals("video") ? ".mp4" : ".jpg");
        String newFilename = UUID.randomUUID() + extension;

        try {
            Path filePath = Paths.get(uploadDir + newFilename);
            Files.write(filePath, file.getBytes());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "File upload failed"));
        }

        String fileUrl = "/" + uploadDir + newFilename;   // e.g., /uploads/sign-videos/abc.mp4
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    // Admin creates a sign
    @PostMapping("/api/admin/signs")
    public ResponseEntity<SignResponse> createSignByAdmin(@Valid @RequestBody SignRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(signService.createSign(request, admin.getUserId()));
    }

    // Teacher creates a sign
    @PostMapping("/api/teacher/signs")
    public ResponseEntity<SignResponse> createSignByTeacher(@Valid @RequestBody SignRequest request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(signService.createSign(request, teacher.getUserId()));
    }

    // Update sign (creator or admin)
    @PutMapping("/api/signs/{id}")
    public ResponseEntity<SignResponse> updateSign(@PathVariable Long id,
                                                   @Valid @RequestBody SignRequest request,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = user.getRole().getRoleName();
        return ResponseEntity.ok(signService.updateSign(id, request, user.getUserId(), role));
    }

    // Delete sign (creator or admin)
    @DeleteMapping("/api/signs/{id}")
    public ResponseEntity<Void> deleteSign(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = user.getRole().getRoleName();
        signService.deleteSign(id, user.getUserId(), role);
        return ResponseEntity.noContent().build();
    }

    // Admin: view all signs
    @GetMapping("/api/admin/signs")
    public ResponseEntity<List<SignResponse>> getAllSignsAdmin() {
        return ResponseEntity.ok(signService.getAllSigns());
    }

    // Teacher: view own signs
    @GetMapping("/api/teacher/signs")
    public ResponseEntity<List<SignResponse>> getOwnSigns(@AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(signService.getOwnSigns(teacher.getUserId()));
    }

    // Any authenticated user (student, teacher, admin) can view a specific sign
    @GetMapping("/api/signs/{id}")
    public ResponseEntity<SignResponse> getSignById(@PathVariable Long id) {
        return ResponseEntity.ok(signService.getSignById(id));
    }
}