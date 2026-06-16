package com.aisignapp.controller;

import com.aisignapp.dto.request.CommentRequest;
import com.aisignapp.dto.response.CommentResponse;
import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@Valid @RequestBody CommentRequest request,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        CommentResponse response = commentService.createComment(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<CommentResponse>> getCommentsForLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(commentService.getCommentsForLesson(lessonId));
    }

    @GetMapping("/translation/{transId}")
    public ResponseEntity<List<CommentResponse>> getCommentsForTranslation(@PathVariable Long transId) {
        return ResponseEntity.ok(commentService.getCommentsForTranslation(transId));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable Long commentId,
                                                         @Valid @RequestBody CommentRequest request,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        CommentResponse response = commentService.updateComment(commentId, user, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String role = user.getRole().getRoleName();
        commentService.deleteComment(commentId, user, role);
        return ResponseEntity.noContent().build();
    }
}