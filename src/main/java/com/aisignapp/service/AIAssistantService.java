package com.aisignapp.service;

import com.aisignapp.dto.response.AIQueryResponse;
import com.aisignapp.entity.Translation;
import com.aisignapp.entity.User;
import com.aisignapp.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIAssistantService {

    private final TranslationRepository translationRepository;

    @Value("${openai.api.key}")
    private String geminiApiKey;

    // Use a currently supported model (change URL as needed)
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent";

    public AIQueryResponse askQuestion(String question, User user) {
        String answer;
        try {
            answer = callGemini(question);
        } catch (Exception e) {
            answer = "I'm sorry, I couldn't process your request right now. Please try again later.";
            System.err.println("Gemini API error: " + e.getMessage());
        }

        Translation record = Translation.builder()
                .user(user)
                .inputText(question)
                .translatedText(answer)
                .confidenceScore(0.95f)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        record = translationRepository.save(record);

        return new AIQueryResponse(answer, record.getTransId());
    }

    private String callGemini(String question) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);

        String systemPrompt = "You are a sign language assistant. Answer only questions related to sign language. If the question is not about sign language, politely say: 'I can only answer questions related to sign language.'";

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", systemPrompt + "\n\nUser question: " + question)
                        ))
                )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response;

        try {
            response = restTemplate.exchange(GEMINI_URL, HttpMethod.POST, entity, Map.class);
        } catch (HttpClientErrorException e) {
            System.err.println("Gemini API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            throw new RuntimeException("Failed to get response from Gemini", e);
        }

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null || !responseBody.containsKey("candidates")) {
            throw new RuntimeException("Invalid response from Gemini: no candidates");
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
        if (candidates.isEmpty()) {
            throw new RuntimeException("No candidates in Gemini response");
        }

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts.isEmpty()) {
            throw new RuntimeException("No parts in content");
        }

        return (String) parts.get(0).get("text");
    }
}