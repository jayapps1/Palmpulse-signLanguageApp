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

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SignController {

    private final SignService signService;
    private final UserRepository userRepository;

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