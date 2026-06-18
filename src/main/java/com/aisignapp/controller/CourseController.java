package com.aisignapp.controller;

import com.aisignapp.dto.request.CourseRequest;
import com.aisignapp.dto.response.CourseResponse;
import com.aisignapp.dto.response.LessonResponse;
import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.CourseService;
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
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepository;
    private final LessonService lessonService;

    // ── Admin only ──
    @PostMapping("/api/admin/courses")
    public ResponseEntity<CourseResponse> createCourseByAdmin(
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(request, admin.getUserId()));
    }

    @PutMapping("/api/admin/courses/{id}")
    public ResponseEntity<CourseResponse> updateCourseByAdmin(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = user.getRole().getRoleName();
        return ResponseEntity.ok(courseService.updateCourse(id, request, user.getUserId(), role));
    }

    @DeleteMapping("/api/admin/courses/{id}")
    public ResponseEntity<Void> deleteCourseByAdmin(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = user.getRole().getRoleName();
        courseService.deleteCourse(id, user.getUserId(), role);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/courses")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCoursesForAdmin());
    }

    // ── Teacher only ──
    @PostMapping("/api/teacher/courses")
    public ResponseEntity<CourseResponse> createCourseByTeacher(
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(request, teacher.getUserId()));
    }

    @PutMapping("/api/teacher/courses/{id}")
    public ResponseEntity<CourseResponse> updateCourseByTeacher(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = teacher.getRole().getRoleName();   // "TEACHER"
        return ResponseEntity.ok(courseService.updateCourse(id, request, teacher.getUserId(), role));
    }

    @DeleteMapping("/api/teacher/courses/{id}")
    public ResponseEntity<Void> deleteCourseByTeacher(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = teacher.getRole().getRoleName();
        courseService.deleteCourse(id, teacher.getUserId(), role);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/teacher/courses")
    public ResponseEntity<List<CourseResponse>> getTeacherCourses(
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(courseService.getOwnCourses(teacher.getUserId()));
    }

    // ── Any authenticated user ──
    @GetMapping("/api/courses/my")
    public ResponseEntity<List<CourseResponse>> getMyCourses(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(courseService.getOwnCourses(user.getUserId()));
    }

    @GetMapping("/api/courses")
    public ResponseEntity<List<CourseResponse>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @GetMapping("/api/courses/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/api/courses/{courseId}/lessons")
    public ResponseEntity<List<LessonResponse>> getLessonsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getLessonsByCourse(courseId));
    }
}