package com.aisignapp.service;

import com.aisignapp.dto.response.AuditLogResponse;
import com.aisignapp.entity.AuditLog;
import com.aisignapp.entity.User;
import com.aisignapp.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(User user, String action, String description) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .description(description)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByUser(User user) {
        return auditLogRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByUserId(Long userId) {
        return auditLogRepository.findByUserUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByAction(String action) {
        return auditLogRepository.findByAction(action).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse convertToResponse(AuditLog log) {
        // Accessing getUser() inside a @Transactional(readOnly = true) session ensures lazy loading works
        return new AuditLogResponse(
                log.getAuditId(),
                log.getUser().getUserId(),
                log.getUser().getEmail(),
                log.getUser().getFullName(),
                log.getAction(),
                log.getDescription(),
                log.getCreatedAt(),
                log.getUpdatedAt()
        );
    }
}