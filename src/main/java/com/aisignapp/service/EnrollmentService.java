package com.aisignapp.service;

import com.aisignapp.dto.response.EnrollmentResponse;
import com.aisignapp.entity.Course;
import com.aisignapp.entity.CourseEnrollment;
import com.aisignapp.entity.User;
import com.aisignapp.repository.CourseEnrollmentRepository;
import com.aisignapp.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EnrollmentResponse> getEnrollmentsByTeacher(Long teacherId) {
        List<Course> teacherCourses = courseRepository.findByCreatedBy(teacherId);
        List<Long> courseIds = teacherCourses.stream()
                .map(Course::getId)
                .collect(Collectors.toList());

        if (courseIds.isEmpty()) {
            return List.of();
        }

        return enrollmentRepository.findByCourseIdIn(courseIds).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EnrollmentResponse mapToResponse(CourseEnrollment enrollment) {
        User student = enrollment.getStudent();
        Course course = enrollment.getCourse();
        return new EnrollmentResponse(
                enrollment.getId(),
                student.getFullName(),
                student.getEmail(),
                course.getTitle(),
                enrollment.getStatus().name(),
                enrollment.getBadge() != null ? enrollment.getBadge().name() : null,
                enrollment.getEnrollmentDate(),   // your entity uses enrollmentDate
                enrollment.getCompletedAt()
        );
    }
}