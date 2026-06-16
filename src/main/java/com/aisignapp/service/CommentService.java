package com.aisignapp.service;

import com.aisignapp.annotation.Loggable;
import com.aisignapp.dto.request.CommentRequest;
import com.aisignapp.dto.response.CommentResponse;
import com.aisignapp.entity.Comment;
import com.aisignapp.entity.Lesson;
import com.aisignapp.entity.Translation;
import com.aisignapp.entity.User;
import com.aisignapp.repository.CommentRepository;
import com.aisignapp.repository.LessonRepository;
import com.aisignapp.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final LessonRepository lessonRepository;
    private final TranslationRepository translationRepository;

    @Transactional
    @Loggable(action = "CREATE_COMMENT", description = "A comment was created")
    public CommentResponse createComment(User user, CommentRequest request) {
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setContent(request.getContent());

        if ("LESSON".equalsIgnoreCase(request.getTargetType())) {
            Lesson lesson = lessonRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
            comment.setLesson(lesson);
        } else if ("TRANSLATION".equalsIgnoreCase(request.getTargetType())) {
            Translation translation = translationRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Translation not found"));
            comment.setTranslation(translation);
        } else {
            throw new RuntimeException("Invalid target type. Use 'LESSON' or 'TRANSLATION'.");
        }

        comment = commentRepository.save(comment);
        return convertToResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        return commentRepository.findByLesson(lesson).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForTranslation(Long transId) {
        Translation translation = translationRepository.findById(transId)
                .orElseThrow(() -> new RuntimeException("Translation not found"));
        return commentRepository.findByTranslation(translation).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Loggable(action = "UPDATE_COMMENT", description = "A comment was updated")
    public CommentResponse updateComment(Long commentId, User user, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You are not authorized to edit this comment");
        }
        comment.setContent(request.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        comment = commentRepository.save(comment);
        return convertToResponse(comment);
    }

    @Transactional
    @Loggable(action = "DELETE_COMMENT", description = "A comment was deleted")
    public void deleteComment(Long commentId, User user, String userRole) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getUserId().equals(user.getUserId()) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }
        commentRepository.deleteById(commentId);
    }

    private CommentResponse convertToResponse(Comment comment) {
        String targetType = comment.getLesson() != null ? "LESSON" : "TRANSLATION";
        Long targetId = comment.getLesson() != null
                ? comment.getLesson().getLessonId()
                : comment.getTranslation().getTransId();
        return new CommentResponse(
                comment.getCommentId(),
                comment.getUser().getUserId(),
                comment.getUser().getFullName(),
                comment.getUser().getEmail(),
                targetId,
                targetType,
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}