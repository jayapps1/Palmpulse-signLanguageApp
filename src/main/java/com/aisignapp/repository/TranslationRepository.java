package com.aisignapp.repository;

import com.aisignapp.entity.Translation;
import com.aisignapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    List<Translation> findByUser(User user);
    List<Translation> findByUserOrderByCreatedAtDesc(User user);
}