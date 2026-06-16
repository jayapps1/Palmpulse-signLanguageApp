package com.aisignapp.repository;

import com.aisignapp.entity.Course;
import com.aisignapp.entity.Progress;
import com.aisignapp.entity.User;
import com.aisignapp.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Optional<Progress> findByUserAndLesson(User user, Lesson lesson);
    long countByUserAndLessonCourseAndIsCompletedTrue(User student, Course course);
}