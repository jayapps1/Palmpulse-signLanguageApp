package com.aisignapp.service;

import com.aisignapp.annotation.Loggable;
import com.aisignapp.dto.request.LessonRequest;
import com.aisignapp.dto.response.LessonResponse;
import com.aisignapp.dto.response.SignResponse;
import com.aisignapp.entity.*;
import com.aisignapp.entity.enums.BadgeLevel;
import com.aisignapp.entity.enums.EnrollmentStatus;
import com.aisignapp.entity.enums.LessonStatus;
import com.aisignapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final SignRepository signRepository;
    private final LessonSignRepository lessonSignRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final ProgressRepository progressRepository;

    @Transactional
    @Loggable(action = "CREATE_LESSON", description = "A new lesson was created")
    public LessonResponse createLesson(LessonRequest request, Long userId) {
        Course course;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
        } else {
            course = courseRepository.findById(1L)
                    .orElseThrow(() -> new RuntimeException("Default course not found"));
        }
        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .content(request.getContent())
                .difficultyLevel(request.getDifficultyLevel())
                .status(request.getStatus() != null ? request.getStatus() : LessonStatus.PUBLISHED)
                .createdBy(userId)
                .course(course)
                .build();
        lesson = lessonRepository.save(lesson);
        return mapToResponse(lesson);
    }

    @Transactional
    @Loggable(action = "UPDATE_LESSON", description = "A lesson was updated")
    public LessonResponse updateLesson(Long lessonId, LessonRequest request, Long userId, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCreatedBy().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Not authorized to edit this lesson");
        }
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setContent(request.getContent());
        lesson.setDifficultyLevel(request.getDifficultyLevel());
        if (request.getStatus() != null) {
            lesson.setStatus(request.getStatus());
        }
        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            lesson.setCourse(course);
        }
        lesson = lessonRepository.save(lesson);
        return mapToResponse(lesson);
    }

    @Transactional
    @Loggable(action = "DELETE_LESSON", description = "A lesson was deleted")
    public void deleteLesson(Long lessonId, Long userId, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCreatedBy().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Not authorized to delete this lesson");
        }
        lessonSignRepository.deleteByLesson_LessonId(lessonId);
        lessonRepository.deleteById(lessonId);
    }

    @Transactional
    @Loggable(action = "ADD_SIGN_TO_LESSON", description = "A sign was added to a lesson")
    public void addSignToLesson(Long lessonId, Long signId, Long userId, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCreatedBy().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Not authorized to modify this lesson");
        }
        Sign sign = signRepository.findById(signId)
                .orElseThrow(() -> new RuntimeException("Sign not found"));
        LessonSignId id = new LessonSignId(lessonId, signId);
        if (lessonSignRepository.existsById(id)) {
            throw new RuntimeException("Sign already added to this lesson");
        }
        LessonSign lessonSign = LessonSign.builder()
                .id(id)
                .lesson(lesson)
                .sign(sign)
                .build();
        lessonSignRepository.save(lessonSign);
    }

    @Transactional
    @Loggable(action = "REMOVE_SIGN_FROM_LESSON", description = "A sign was removed from a lesson")
    public void removeSignFromLesson(Long lessonId, Long signId, Long userId, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCreatedBy().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Not authorized to modify this lesson");
        }
        lessonSignRepository.deleteByLesson_LessonIdAndSign_SignId(lessonId, signId);
    }

    @Transactional
    @Loggable(action = "COMPLETE_LESSON", description = "A lesson was marked as completed by a student")
    public void markLessonCompleted(Long lessonId, User student) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        CourseEnrollment activeEnrollment = courseEnrollmentRepository
                .findByStudentAndStatus(student, EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active enrollment"));

        if (!activeEnrollment.getCourse().getId().equals(lesson.getCourse().getId())) {
            throw new RuntimeException("Lesson does not belong to your active course");
        }

        // Save or update progress
        Progress progress = progressRepository.findByUserAndLesson(student, lesson)
                .orElse(new Progress());
        progress.setUser(student);
        progress.setLesson(lesson);
        progress.setCompleted(true);
        progress.setCompletionPercentage(100.0f);
        progress.setUpdatedAt(LocalDateTime.now());
        progressRepository.save(progress);

        // Calculate overall course completion percentage
        Course course = lesson.getCourse();
        List<Lesson> allLessons = lessonRepository.findByCourse(course);
        long completedCount = allLessons.stream()
                .filter(l -> progressRepository.findByUserAndLesson(student, l)
                        .map(Progress::isCompleted).orElse(false))
                .count();
        double percentage = (double) completedCount / allLessons.size() * 100;

        // Update badge based on percentage
        BadgeLevel badge = getBadgeForPercentage(percentage);
        // Override Platinum with Diamond – Platinum is only from quiz
        if (badge == BadgeLevel.PLATINUM) {
            badge = BadgeLevel.DIAMOND;
        }
        activeEnrollment.setBadge(badge);
        courseEnrollmentRepository.save(activeEnrollment);

        // ─── Auto‑complete is REMOVED ───
        // The course will be completed only after passing the final quiz (handled in QuizService).
    }

    // Helper to determine badge based on completion percentage
    private BadgeLevel getBadgeForPercentage(double percentage) {
        if (percentage >= 100) return BadgeLevel.PLATINUM;
        if (percentage >= 75) return BadgeLevel.DIAMOND;
        if (percentage >= 50) return BadgeLevel.GOLD;
        if (percentage >= 25) return BadgeLevel.SILVER;
        return null; // no badge yet
    }

    public List<SignResponse> getSignsForLesson(Long lessonId) {
        return lessonSignRepository.findByLesson_LessonId(lessonId).stream()
                .map(ls -> mapSignToResponse(ls.getSign()))
                .collect(Collectors.toList());
    }

    public List<LessonResponse> getAllLessonsForAdmin() {
        return lessonRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<LessonResponse> getOwnLessons(Long teacherId) {
        return lessonRepository.findByCreatedBy(teacherId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<LessonResponse> getLessonsForStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        var activeEnrollment = courseEnrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.ACTIVE);
        if (activeEnrollment.isEmpty()) {
            return Collections.emptyList();
        }
        Course activeCourse = activeEnrollment.get().getCourse();
        return lessonRepository.findByCourseAndStatus(activeCourse, LessonStatus.PUBLISHED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public LessonResponse getLessonById(Long lessonId, User currentUser, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if ("ADMIN".equals(userRole)) {
            return mapToResponse(lesson);
        }
        if ("TEACHER".equals(userRole)) {
            if (!lesson.getCreatedBy().equals(currentUser.getUserId())) {
                throw new RuntimeException("Not authorized to view this lesson");
            }
            return mapToResponse(lesson);
        }
        if ("STUDENT".equals(userRole)) {
            var activeEnrollment = courseEnrollmentRepository.findByStudentAndStatus(currentUser, EnrollmentStatus.ACTIVE);
            if (activeEnrollment.isEmpty() || !activeEnrollment.get().getCourse().getId().equals(lesson.getCourse().getId())) {
                throw new RuntimeException("Not enrolled in the course that contains this lesson");
            }
            if (lesson.getStatus() != LessonStatus.PUBLISHED) {
                throw new RuntimeException("Lesson not published");
            }
            return mapToResponse(lesson);
        }
        throw new RuntimeException("Access denied");
    }

    public List<LessonResponse> getLessonsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return lessonRepository.findByCourse(course).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getLessonId(),
                lesson.getCourse() != null ? lesson.getCourse().getId() : null,
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getContent(),
                lesson.getDifficultyLevel(),
                lesson.getStatus(),
                lesson.getCreatedBy(),
                lesson.getCreatedAt(),
                lesson.getUpdatedAt()
        );
    }

    private SignResponse mapSignToResponse(Sign sign) {
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