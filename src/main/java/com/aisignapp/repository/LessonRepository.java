package com.aisignapp.repository;

import com.aisignapp.entity.Course;
import com.aisignapp.entity.Lesson;
import com.aisignapp.entity.enums.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    // Teachers: get their own lessons (created by them)
    List<Lesson> findByCreatedBy(Long createdBy);

    // Admin: get all lessons ordered by creation date (newest first)
    List<Lesson> findAllByOrderByCreatedAtDesc();

    // Check ownership (used in update/delete authorization)
    boolean existsByLessonIdAndCreatedBy(Long lessonId, Long createdBy);

    // Get all lessons belonging to a specific course
    List<Lesson> findByCourse(Course course);


    // Get published lessons of a specific course (for students)
    List<Lesson> findByCourseAndStatus(Course course, LessonStatus status);

    // Optionally, get lessons of a course ordered by creation date (for consistent display)
    List<Lesson> findByCourseOrderByCreatedAtAsc(Course course);
}