package com.aisignapp.repository;

import com.aisignapp.entity.Course;
import com.aisignapp.entity.enums.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByStatus(LessonStatus status);
    List<Course> findByCreatedBy(Long userId);
}