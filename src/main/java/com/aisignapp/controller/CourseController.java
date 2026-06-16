package com.aisignapp.controller;

import com.aisignapp.dto.request.CourseRequest;
import com.aisignapp.dto.response.CourseResponse;
import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.CourseService;
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

    // Admin only
    @PostMapping("/api/admin/courses")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(request, admin.getUserId()));
    }

    @PutMapping("/api/admin/courses/{id}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id,
                                                       @Valid @RequestBody CourseRequest request,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = user.getRole().getRoleName();
        return ResponseEntity.ok(courseService.updateCourse(id, request, user.getUserId(), role));
    }

    @DeleteMapping("/api/admin/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String role = user.getRole().getRoleName();
        courseService.deleteCourse(id, user.getUserId(), role);
        return ResponseEntity.noContent().build();
    }

    // Admin only – list all courses
    @GetMapping("/api/admin/courses")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCoursesForAdmin());
    }

    // Public (authenticated) – list published courses
    @GetMapping("/api/courses")
    public ResponseEntity<List<CourseResponse>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @GetMapping("/api/courses/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }
}