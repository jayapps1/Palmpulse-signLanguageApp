package com.aisignapp.service;

import com.aisignapp.annotation.Loggable;
import com.aisignapp.dto.request.CourseRequest;
import com.aisignapp.dto.response.CourseResponse;
import com.aisignapp.entity.Course;
import com.aisignapp.entity.enums.LessonStatus;
import com.aisignapp.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    @Transactional
    @Loggable(action = "CREATE_COURSE", description = "A new course was created")
    public CourseResponse createCourse(CourseRequest request, Long userId) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .difficultyLevel(request.getDifficultyLevel())
                .status(request.getStatus() != null ? request.getStatus() : LessonStatus.PUBLISHED)
                .createdBy(userId)
                .build();
        course = courseRepository.save(course);
        return convertToResponse(course);
    }

    @Transactional
    @Loggable(action = "UPDATE_COURSE", description = "A course was updated")
    public CourseResponse updateCourse(Long id, CourseRequest request, Long userId, String userRole) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getCreatedBy().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Not authorized to edit this course");
        }
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setDifficultyLevel(request.getDifficultyLevel());
        if (request.getStatus() != null) course.setStatus(request.getStatus());
        course = courseRepository.save(course);
        return convertToResponse(course);
    }

    @Transactional
    @Loggable(action = "DELETE_COURSE", description = "A course was deleted")
    public void deleteCourse(Long id, Long userId, String userRole) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getCreatedBy().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Not authorized to delete this course");
        }
        courseRepository.deleteById(id);
    }

    public List<CourseResponse> getAllCoursesForAdmin() {
        return courseRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getPublishedCourses() {
        return courseRepository.findByStatus(LessonStatus.PUBLISHED).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // FIXED: use convertToResponse instead of mapToResponse
    public List<CourseResponse> getOwnCourses(Long userId) {
        return courseRepository.findByCreatedBy(userId)
                .stream()
                .map(this::convertToResponse)          // ← corrected
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return convertToResponse(course);
    }

    // Public method for other services to convert Course -> CourseResponse
    public CourseResponse convertToResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getDifficultyLevel(),
                course.getStatus(),
                course.getCreatedBy(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }
}