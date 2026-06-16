package com.aisignapp.repository;

import com.aisignapp.entity.Sign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SignRepository extends JpaRepository<Sign, Long> {
    List<Sign> findBySignNameContainingIgnoreCase(String keyword);
    List<Sign> findByCreatedBy(Long createdBy);
}