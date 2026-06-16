package com.aisignapp.controller;

import com.aisignapp.dto.request.LessonRequest;
import com.aisignapp.dto.response.LessonResponse;
import com.aisignapp.dto.response.SignResponse;
import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.LessonService;
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
public class LessonController {

    private final LessonService lessonService;
    private final UserRepository userRepository;

    // Admin creates a lesson
    @PostMapping("/api/admin/lessons")
    public ResponseEntity<LessonResponse> createLessonByAdmin(@Valid @RequestBody LessonRequest request,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        LessonResponse response = lessonService.createLesson(request, admin.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Teacher creates a lesson
    @PostMapping("/api/teacher/lessons")
    public ResponseEntity<LessonResponse> createLessonByTeacher(@Valid @RequestBody LessonRequest request,
                                                                @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"TEACHER".equals(teacher.getRole().getRoleName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        LessonResponse response = lessonService.createLesson(request, teacher.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update lesson (creator or admin)
    @PutMapping("/api/lessons/{id}")
    public ResponseEntity<LessonResponse> updateLesson(@PathVariable Long id,
                                                       @Valid @RequestBody LessonRequest request,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String role = user.getRole().getRoleName();
        LessonResponse response = lessonService.updateLesson(id, request, user.getUserId(), role);
        return ResponseEntity.ok(response);
    }

    // Delete lesson (creator or admin)
    @DeleteMapping("/api/lessons/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String role = user.getRole().getRoleName();
        lessonService.deleteLesson(id, user.getUserId(), role);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/lessons/{lessonId}/signs/{signId}")
    public ResponseEntity<?> addSignToLesson(@PathVariable Long lessonId,
                                             @PathVariable Long signId,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = user.getRole().getRoleName();
        lessonService.addSignToLesson(lessonId, signId, user.getUserId(), role);
        return ResponseEntity.ok("Sign added to lesson");
    }

    @DeleteMapping("/api/lessons/{lessonId}/signs/{signId}")
    public ResponseEntity<?> removeSignFromLesson(@PathVariable Long lessonId,
                                                  @PathVariable Long signId,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = user.getRole().getRoleName();
        lessonService.removeSignFromLesson(lessonId, signId, user.getUserId(), role);
        return ResponseEntity.ok("Sign removed from lesson");
    }

    @PostMapping("/api/students/lessons/{lessonId}/complete")
    public ResponseEntity<?> completeLesson(@PathVariable Long lessonId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        lessonService.markLessonCompleted(lessonId, student);
        return ResponseEntity.ok("Lesson marked as completed");
    }

    @GetMapping("/api/lessons/{lessonId}/signs")
    public ResponseEntity<List<SignResponse>> getLessonSigns(@PathVariable Long lessonId) {
        return ResponseEntity.ok(lessonService.getSignsForLesson(lessonId));
    }

    // Admin: view all lessons
    @GetMapping("/api/admin/lessons")
    public ResponseEntity<List<LessonResponse>> getAllLessonsAdmin() {
        return ResponseEntity.ok(lessonService.getAllLessonsForAdmin());
    }

    // Teacher: view own lessons
    @GetMapping("/api/teacher/lessons")
    public ResponseEntity<List<LessonResponse>> getMyLessons(@AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(lessonService.getOwnLessons(teacher.getUserId()));
    }

    // Student: view lessons from enrolled teacher
    @GetMapping("/api/students/lessons")
    public ResponseEntity<List<LessonResponse>> getStudentLessons(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(lessonService.getLessonsForStudent(student.getUserId()));
    }

    // Get a single lesson by ID (with role-based access)
    @GetMapping("/api/lessons/{id}")
    public ResponseEntity<LessonResponse> getLessonById(@PathVariable Long id,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String role = user.getRole().getRoleName();
        LessonResponse response = lessonService.getLessonById(id, user, role);
        return ResponseEntity.ok(response);
    }
}