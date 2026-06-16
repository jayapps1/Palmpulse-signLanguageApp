package com.aisignapp.service;

import com.aisignapp.dto.request.SignRequest;
import com.aisignapp.dto.response.SignResponse;
import com.aisignapp.entity.Sign;
import com.aisignapp.repository.SignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SignService {

    private final SignRepository signRepository;

    @Transactional
    public SignResponse createSign(SignRequest request, Long userId) {
        Sign sign = Sign.builder()
                .signName(request.getSignName())
                .description(request.getDescription())
                .videoUrl(request.getVideoUrl())
                .imageUrl(request.getImageUrl())
                .createdBy(userId)
                .build();
        sign = signRepository.save(sign);
        return mapToResponse(sign);
    }

    @Transactional
    public SignResponse updateSign(Long signId, SignRequest request, Long userId, String userRole) {
        Sign sign = signRepository.findById(signId)
                .orElseThrow(() -> new RuntimeException("Sign not found"));
        if (!sign.getCreatedBy().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Not authorized to edit this sign");
        }
        sign.setSignName(request.getSignName());
        sign.setDescription(request.getDescription());
        sign.setVideoUrl(request.getVideoUrl());
        sign.setImageUrl(request.getImageUrl());
        sign = signRepository.save(sign);
        return mapToResponse(sign);
    }

    @Transactional
    public void deleteSign(Long signId, Long userId, String userRole) {
        Sign sign = signRepository.findById(signId)
                .orElseThrow(() -> new RuntimeException("Sign not found"));
        if (!sign.getCreatedBy().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Not authorized to delete this sign");
        }
        signRepository.deleteById(signId);
    }

    public List<SignResponse> getAllSigns() {
        return signRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SignResponse> getOwnSigns(Long userId) {
        return signRepository.findByCreatedBy(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SignResponse getSignById(Long signId) {
        Sign sign = signRepository.findById(signId)
                .orElseThrow(() -> new RuntimeException("Sign not found"));
        return mapToResponse(sign);
    }

    private SignResponse mapToResponse(Sign sign) {
        return new SignResponse(
                sign.getSignId(),
                sign.getSignName(),
                sign.getDescription(),
                sign.getVideoUrl(),
                sign.getImageUrl(),
                sign.getCreatedBy(),
                sign.getCreatedAt(),
                sign.getUpdatedAt()
        );
    }
}