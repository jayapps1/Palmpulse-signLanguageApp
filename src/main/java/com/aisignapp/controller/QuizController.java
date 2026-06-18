package com.aisignapp.controller;

import com.aisignapp.annotation.Loggable;
import com.aisignapp.dto.request.QuizRequest;
import com.aisignapp.dto.response.QuizResponse;
import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    @PostMapping("/api/admin/quizzes")
    @Loggable(action = "CREATE_QUIZ", description = "Admin created a quiz")
    public ResponseEntity<QuizResponse> createQuizByAdmin(@Valid @RequestBody QuizRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.createQuiz(request, admin.getUserId()));
    }

    @PostMapping("/api/teacher/quizzes")
    @Loggable(action = "CREATE_QUIZ", description = "Teacher created a quiz")
    public ResponseEntity<QuizResponse> createQuizByTeacher(@Valid @RequestBody QuizRequest request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.createQuiz(request, teacher.getUserId()));
    }

    // Admin: list all quizzes
    @GetMapping("/api/admin/quizzes")
    public ResponseEntity<List<QuizResponse>> getAllQuizzesAdmin() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    // Teacher: list own quizzes
    @GetMapping("/api/teacher/quizzes")
    public ResponseEntity<List<QuizResponse>> getTeacherQuizzes(
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(quizService.getOwnQuizzes(teacher.getUserId()));
    }

    @PutMapping("/api/quizzes/{quizId}")
    @Loggable(action = "UPDATE_QUIZ", description = "Quiz updated")
    public ResponseEntity<QuizResponse> updateQuiz(@PathVariable Long quizId,
                                                   @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(quizId, request));
    }

    @DeleteMapping("/api/quizzes/{quizId}")
    @Loggable(action = "DELETE_QUIZ", description = "Quiz deleted")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }
}