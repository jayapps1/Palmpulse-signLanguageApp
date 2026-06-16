package com.aisignapp.controller;

import com.aisignapp.dto.request.RegisterRequest;
import com.aisignapp.dto.response.UserResponse;
import com.aisignapp.entity.Role;
import com.aisignapp.entity.User;
import com.aisignapp.repository.RoleRepository;
import com.aisignapp.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // Create a teacher account (by admin)
    @PostMapping("/teacher")
    public ResponseEntity<?> createTeacher(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        Role teacherRole = roleRepository.findByRoleName("TEACHER")
                .orElseThrow(() -> new RuntimeException("TEACHER role not found"));

        User teacher = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(teacherRole)
                .build();
        userRepository.save(teacher);
        return ResponseEntity.status(HttpStatus.CREATED).body("Teacher account created");
    }

    // Create another admin account (only by existing admin)
    @PostMapping("/admin")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        User admin = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(adminRole)
                .build();
        userRepository.save(admin);
        return ResponseEntity.status(HttpStatus.CREATED).body("Admin account created");
    }

    // List all users (for admin dashboard)
    @GetMapping
    public ResponseEntity<List<UserResponse>> listAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(user -> new UserResponse(
                        user.getUserId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().getRoleName(),
                        user.getProfilePictureUrl()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // Delete a user (optional)
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok("User deleted");
    }
}