package com.aisignapp.repository;

import com.aisignapp.entity.AIFeedback;
import com.aisignapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIFeedbackRepository extends JpaRepository<AIFeedback, Long> {
    List<AIFeedback> findByUserOrderByCreatedAtDesc(User user);
    List<AIFeedback> findByPredictedSign(String predictedSign);
}