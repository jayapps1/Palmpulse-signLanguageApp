package com.aisignapp.service;

import com.aisignapp.dto.response.ActiveCourseResponse;
import com.aisignapp.dto.response.CourseResponse;
import com.aisignapp.entity.Course;
import com.aisignapp.entity.CourseEnrollment;
import com.aisignapp.entity.User;
import com.aisignapp.entity.enums.BadgeLevel;
import com.aisignapp.entity.enums.EnrollmentStatus;
import com.aisignapp.repository.CourseEnrollmentRepository;
import com.aisignapp.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseEnrollmentService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final CourseService courseService;

    @Transactional
    public void enrollInCourse(User student, Long courseId) {
        if (enrollmentRepository.existsByStudentAndStatus(student, EnrollmentStatus.ACTIVE)) {
            throw new RuntimeException("You already have an active enrollment. Complete it first.");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        CourseEnrollment enrollment = CourseEnrollment.builder()
                .student(student)
                .course(course)
                .status(EnrollmentStatus.ACTIVE)
                .enrollmentDate(LocalDateTime.now())
                .build();
        enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void completeActiveCourse(User student) {
        CourseEnrollment active = enrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active enrollment found"));
        active.setStatus(EnrollmentStatus.COMPLETED);
        active.setCompletedAt(LocalDateTime.now());
        enrollmentRepository.save(active);
    }

    // Return active enrollment with badge and status
    public ActiveCourseResponse getActiveCourse(User student) {
        return enrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.ACTIVE)
                .map(enrollment -> new ActiveCourseResponse(
                        courseService.convertToResponse(enrollment.getCourse()),
                        enrollment.getBadge(),
                        enrollment.getStatus().name()
                ))
                .orElse(null);
    }

    // Optional: get only the badge (for lightweight endpoint)
    public BadgeLevel getActiveBadge(User student) {
        return enrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.ACTIVE)
                .map(CourseEnrollment::getBadge)
                .orElse(null);
    }

    // Helper to get the active enrollment entity (if needed elsewhere)
    public Optional<CourseEnrollment> getActiveEnrollmentEntity(User student) {
        return enrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.ACTIVE);
    }
}