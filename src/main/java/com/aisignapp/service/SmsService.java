package com.aisignapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class SmsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${arkesel.api.key}")
    private String apiKey;

    @Value("${arkesel.api.sender-id:PalmPulse}")
    private String senderId;

    public void sendSms(String phoneNumber, String message) {
        try {
            String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
            String url = String.format(
                    "https://sms.arkesel.com/sms/api?action=send-sms&api_key=%s&to=%s&from=%s&sms=%s",
                    apiKey, phoneNumber, senderId, encodedMessage
            );

            System.out.println(">>> Sending SMS to: " + phoneNumber);
            System.out.println(">>> URL: " + url);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            System.out.println(">>> Response status: " + response.getStatusCode());
            System.out.println(">>> Response body: " + response.getBody());

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to send SMS: " + response.getBody());
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("SMS sending failed: " + e.getMessage(), e);
        }
    }
}