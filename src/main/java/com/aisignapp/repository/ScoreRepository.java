package com.aisignapp.repository;

import com.aisignapp.entity.Score;
import com.aisignapp.entity.User;
import com.aisignapp.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByUser(User user);
    List<Score> findByUserOrderByCreatedAtDesc(User user);
    List<Score> findByQuiz(Quiz quiz);
}