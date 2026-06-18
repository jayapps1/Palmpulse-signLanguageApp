package com.aisignapp.controller;

import com.aisignapp.entity.Notification;
import com.aisignapp.entity.User;
import com.aisignapp.repository.NotificationRepository;
import com.aisignapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Get notifications for the logged‑in user
    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        List<Notification> notifications = notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications);
    }

    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    // Mark all as read
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }

    // Bulk delete notifications
    @DeleteMapping
    public ResponseEntity<Void> deleteNotifications(@RequestBody List<Long> ids) {
        notificationRepository.deleteAllById(ids);
        return ResponseEntity.ok().build();
    }
}