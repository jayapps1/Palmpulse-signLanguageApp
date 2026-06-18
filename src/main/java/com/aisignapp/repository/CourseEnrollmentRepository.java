package com.aisignapp.repository;

import com.aisignapp.entity.CourseEnrollment;
import com.aisignapp.entity.User;
import com.aisignapp.entity.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    Optional<CourseEnrollment> findByStudentAndStatus(User student, EnrollmentStatus status);
    boolean existsByStudentAndStatus(User student, EnrollmentStatus status);
    List<CourseEnrollment> findByCourseIdIn(List<Long> courseIds);
}