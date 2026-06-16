package com.aisignapp.controller;

import com.aisignapp.dto.response.ActiveCourseResponse;
import com.aisignapp.dto.response.CourseResponse;
import com.aisignapp.entity.User;
import com.aisignapp.entity.enums.BadgeLevel;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.CourseEnrollmentService;
import com.aisignapp.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentEnrollmentController {

    private final CourseService courseService;
    private final CourseEnrollmentService enrollmentService;
    private final UserRepository userRepository;

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getAllPublishedCourses() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @PostMapping("/courses/{courseId}/enroll")
    public ResponseEntity<?> enrollInCourse(@PathVariable Long courseId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            enrollmentService.enrollInCourse(student, courseId);
            return ResponseEntity.ok("Enrolled in course successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/courses/complete")
    public ResponseEntity<?> completeActiveCourse(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            enrollmentService.completeActiveCourse(student);
            return ResponseEntity.ok("Course completed! You can now enroll in another course.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me/active-course")
    public ResponseEntity<ActiveCourseResponse> getActiveCourse(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        ActiveCourseResponse response = enrollmentService.getActiveCourse(student);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.noContent().build();
    }

    // Optional: lightweight badge endpoint
    @GetMapping("/me/badge")
    public ResponseEntity<?> getCurrentBadge(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        ActiveCourseResponse active = enrollmentService.getActiveCourse(student);
        if (active == null) {
            return ResponseEntity.ok(Map.of("badge", "NONE"));
        }
        BadgeLevel badge = active.getBadge();
        return ResponseEntity.ok(Map.of("badge", badge != null ? badge.name() : "NONE"));
    }
}