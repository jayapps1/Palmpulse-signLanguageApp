package com.aisignapp.service;

import com.aisignapp.entity.User;
import com.aisignapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TwoFactorAuthService {

    private final UserRepository userRepository;
    private final SmsService smsService;

    @Transactional
    public void generateAndSendCode(User user) {
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            throw new RuntimeException("Phone number is required for SMS 2FA");
        }

        String code = String.format("%06d", new Random().nextInt(999999));
        user.setTwoFactorCode(code);
        user.setTwoFactorCodeExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        String message = "Your PalmPulse verification code is: " + code;
        smsService.sendSms(user.getPhoneNumber(), message);
    }

    @Transactional
    public boolean validateCode(User user, String code) {
        if (user.getTwoFactorCode() == null || user.getTwoFactorCodeExpiry() == null) {
            return false;
        }
        if (user.getTwoFactorCodeExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }
        return user.getTwoFactorCode().equals(code);
    }

    @Transactional
    public void clearCode(User user) {
        user.setTwoFactorCode(null);
        user.setTwoFactorCodeExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void enable2FA(User user) {
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            throw new RuntimeException("Add a phone number to your profile before enabling 2FA.");
        }
        user.set2faEnabled(true);   // ✅ correct Lombok setter
        userRepository.save(user);
    }

    @Transactional
    public void disable2FA(User user) {
        user.set2faEnabled(false);  // ✅ correct Lombok setter
        userRepository.save(user);
    }
}