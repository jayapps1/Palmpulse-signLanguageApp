package com.aisignapp.repository;

import com.aisignapp.entity.Quiz;
import com.aisignapp.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByLesson(Lesson lesson);
}