package com.aisignapp.controller;

import com.aisignapp.dto.request.AIQueryRequest;
import com.aisignapp.dto.response.AIQueryResponse;
import com.aisignapp.entity.AIFeedback;
import com.aisignapp.entity.Translation;
import com.aisignapp.entity.User;
import com.aisignapp.repository.AIFeedbackRepository;
import com.aisignapp.repository.TranslationRepository;
import com.aisignapp.repository.UserRepository;
import com.aisignapp.service.AIAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIAssistantService aiAssistantService;
    private final UserRepository userRepository;
    private final TranslationRepository translationRepository;
    private final AIFeedbackRepository aiFeedbackRepository;

    @PostMapping("/ask")
    public ResponseEntity<AIQueryResponse> ask(@Valid @RequestBody AIQueryRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        AIQueryResponse response = aiAssistantService.askQuestion(request.getQuestion(), user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/feedback/{transId}")
    public ResponseEntity<?> giveFeedback(@PathVariable Long transId,
                                          @RequestParam boolean helpful,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Translation translation = translationRepository.findById(transId)
                .orElseThrow(() -> new RuntimeException("Translation record not found"));

        AIFeedback feedback = AIFeedback.builder()
                .user(user)
                .inputText(translation.getInputText())
                .predictedSign(translation.getTranslatedText())
                .feedbackText(helpful ? "helpful" : "not helpful")
                .confidenceScore(translation.getConfidenceScore())
                .build();
        aiFeedbackRepository.save(feedback);

        return ResponseEntity.ok("Feedback recorded. Thank you!");
    }
}