package com.aisignapp.repository;

import com.aisignapp.entity.AuditLog;
import com.aisignapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserOrderByCreatedAtDesc(User user);
    List<AuditLog> findByAction(String action);
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    List<AuditLog> findByUserUserIdOrderByCreatedAtDesc(Long userId);

}