package com.aisignapp.controller;

import com.aisignapp.dto.request.QuizSubmissionRequest;
import com.aisignapp.dto.response.QuizResponse;
import com.aisignapp.dto.response.QuizSubmissionResponse;
import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentQuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    @GetMapping("/lessons/{lessonId}/quiz")
    public ResponseEntity<QuizResponse> getQuizForLesson(@PathVariable Long lessonId,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        QuizResponse response = quizService.getQuizForLesson(lessonId, student);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/quizzes/submit")
    public ResponseEntity<QuizSubmissionResponse> submitQuiz(@Valid @RequestBody QuizSubmissionRequest request,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        QuizSubmissionResponse response = quizService.submitQuiz(request, student);
        return ResponseEntity.ok(response);
    }
}