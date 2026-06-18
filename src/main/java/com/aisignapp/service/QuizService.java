package com.aisignapp.service;

import com.aisignapp.annotation.Loggable;
import com.aisignapp.dto.request.QuizQuestionRequest;
import com.aisignapp.dto.request.QuizRequest;
import com.aisignapp.dto.request.QuizSubmissionRequest;
import com.aisignapp.dto.response.QuizQuestionResponse;
import com.aisignapp.dto.response.QuizResponse;
import com.aisignapp.dto.response.QuizSubmissionResponse;
import com.aisignapp.entity.*;
import com.aisignapp.entity.enums.BadgeLevel;
import com.aisignapp.entity.enums.EnrollmentStatus;
import com.aisignapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private static final Logger log = LoggerFactory.getLogger(QuizService.class);

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ScoreRepository scoreRepository;
    private final LessonRepository lessonRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final ProgressRepository progressRepository;

    @Transactional
    @Loggable(action = "CREATE_QUIZ", description = "A new quiz was created")
    public QuizResponse createQuiz(QuizRequest request, Long userId) {
        log.info("Creating quiz for lesson {} by user {}", request.getLessonId(), userId);

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Quiz quiz = Quiz.builder()
                .lesson(lesson)
                .title(request.getTitle())
                .isFinalQuiz(request.getIsFinalQuiz() != null ? request.getIsFinalQuiz() : false)
                .numberOfQuestions(request.getNumberOfQuestions())
                .build();
        quiz = quizRepository.save(quiz);

        if (request.getQuestions() != null) {
            for (QuizQuestionRequest qr : request.getQuestions()) {
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(quiz)
                        .questionText(qr.getQuestionText())
                        .optionA(qr.getOptionA())
                        .optionB(qr.getOptionB())
                        .optionC(qr.getOptionC())
                        .optionD(qr.getOptionD())
                        .correctAnswer(qr.getCorrectAnswer())
                        .build();
                quizQuestionRepository.save(question);
            }
        }

        log.info("Quiz created with ID: {}", quiz.getQuizId());
        return mapToResponse(quiz, quizQuestionRepository.findByQuiz(quiz));
    }

    @Transactional
    @Loggable(action = "UPDATE_QUIZ", description = "A quiz was updated")
    public QuizResponse updateQuiz(Long quizId, QuizRequest request) {
        log.info("Updating quiz with ID: {}", quizId);

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setTitle(request.getTitle());
        quiz.setFinalQuiz(request.getIsFinalQuiz() != null ? request.getIsFinalQuiz() : false);
        quiz.setNumberOfQuestions(request.getNumberOfQuestions());
        quiz = quizRepository.save(quiz);

        // Remove old questions and add new ones
        quizQuestionRepository.deleteAll(quizQuestionRepository.findByQuiz(quiz));
        if (request.getQuestions() != null) {
            for (QuizQuestionRequest qr : request.getQuestions()) {
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(quiz)
                        .questionText(qr.getQuestionText())
                        .optionA(qr.getOptionA())
                        .optionB(qr.getOptionB())
                        .optionC(qr.getOptionC())
                        .optionD(qr.getOptionD())
                        .correctAnswer(qr.getCorrectAnswer())
                        .build();
                quizQuestionRepository.save(question);
            }
        }

        log.info("Quiz updated: {}", quizId);
        return mapToResponse(quiz, quizQuestionRepository.findByQuiz(quiz));
    }

    @Transactional
    @Loggable(action = "DELETE_QUIZ", description = "A quiz was deleted")
    public void deleteQuiz(Long quizId) {
        log.info("Deleting quiz with ID: {}", quizId);

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        quizQuestionRepository.deleteAll(quizQuestionRepository.findByQuiz(quiz));
        quizRepository.delete(quiz);

        log.info("Quiz deleted: {}", quizId);
    }

    @Transactional(readOnly = true)
    public QuizResponse getQuizForLesson(Long lessonId, User student) {
        log.debug("Fetching quiz for lesson {} for student {}", lessonId, student.getUserId());

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        Course course = lesson.getCourse();
        if (course == null) {
            throw new RuntimeException("This lesson is not associated with any course");
        }

        CourseEnrollment enrollment = courseEnrollmentRepository
                .findByStudentAndStatus(student, EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("You are not enrolled in any active course"));
        if (!enrollment.getCourse().getId().equals(course.getId())) {
            throw new RuntimeException("You are not enrolled in this course");
        }

        Quiz quiz = quizRepository.findByLesson(lesson)
                .orElseThrow(() -> new RuntimeException("No quiz for this lesson"));

        if (quiz.isFinalQuiz()) {
            List<Lesson> allLessons = lessonRepository.findByCourse(course);
            long completedCount = allLessons.stream()
                    .filter(l -> progressRepository.findByUserAndLesson(student, l)
                            .map(Progress::isCompleted).orElse(false))
                    .count();
            if (completedCount < allLessons.size()) {
                throw new RuntimeException("You must complete all lessons before taking the final quiz");
            }
        }

        List<QuizQuestion> allQuestions = quizQuestionRepository.findByQuiz(quiz);
        Collections.shuffle(allQuestions);
        int limit = quiz.getNumberOfQuestions() != null ? quiz.getNumberOfQuestions() : allQuestions.size();
        List<QuizQuestion> selected = allQuestions.stream().limit(limit).collect(Collectors.toList());
        return mapToResponseWithoutCorrect(quiz, selected);
    }

    // FIXED: now uses mapToResponse(quiz, questions)
    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(quiz -> {
                    List<QuizQuestion> questions = quizQuestionRepository.findByQuiz(quiz);
                    return mapToResponse(quiz, questions);
                })
                .collect(Collectors.toList());
    }

    // FIXED: now uses mapToResponse(quiz, questions)
    public List<QuizResponse> getOwnQuizzes(Long userId) {
        return quizRepository.findAll().stream()
                .filter(quiz -> quiz.getLesson().getCreatedBy().equals(userId))
                .map(quiz -> {
                    List<QuizQuestion> questions = quizQuestionRepository.findByQuiz(quiz);
                    return mapToResponse(quiz, questions);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    @Loggable(action = "SUBMIT_QUIZ", description = "A student submitted a quiz")
    public QuizSubmissionResponse submitQuiz(QuizSubmissionRequest request, User student) {
        log.info("Student {} submitting quiz {}", student.getUserId(), request.getQuizId());

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        Lesson lesson = quiz.getLesson();
        Course course = lesson.getCourse();
        if (course == null) {
            throw new RuntimeException("This quiz's lesson is not associated with any course");
        }

        CourseEnrollment enrollment = courseEnrollmentRepository
                .findByStudentAndStatus(student, EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("You are not enrolled in any active course"));
        if (!enrollment.getCourse().getId().equals(course.getId())) {
            throw new RuntimeException("You are not enrolled in the course for this quiz");
        }

        if (quiz.isFinalQuiz()) {
            List<Lesson> allLessons = lessonRepository.findByCourse(course);
            long completedCount = allLessons.stream()
                    .filter(l -> progressRepository.findByUserAndLesson(student, l)
                            .map(Progress::isCompleted).orElse(false))
                    .count();
            if (completedCount < allLessons.size()) {
                throw new RuntimeException("You must complete all lessons before taking the final quiz");
            }
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuiz(quiz);
        int total = questions.size();
        int correct = 0;
        for (QuizQuestion q : questions) {
            String selected = request.getAnswers().get(q.getQuestionId());
            if (selected != null && selected.equalsIgnoreCase(q.getCorrectAnswer())) {
                correct++;
            }
        }
        double percentage = (double) correct / total * 100;
        boolean passed = percentage >= 70.0;

        Score score = Score.builder()
                .user(student)
                .quiz(quiz)
                .score(correct)
                .total(total)
                .build();
        score = scoreRepository.save(score);

        String badgeAwarded = null;
        if (quiz.isFinalQuiz() && passed) {
            enrollment.setBadge(BadgeLevel.PLATINUM);
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(LocalDateTime.now());
            courseEnrollmentRepository.save(enrollment);
            badgeAwarded = "PLATINUM";
        }

        log.info("Quiz submission result: score={}/{}, passed={}, badgeAwarded={}",
                correct, total, passed, badgeAwarded);

        return new QuizSubmissionResponse(
                score.getScoreId(),
                correct,
                total,
                percentage,
                passed,
                badgeAwarded
        );
    }

    // ───── Mappers ─────
    private QuizResponse mapToResponse(Quiz quiz, List<QuizQuestion> questions) {
        List<QuizQuestionResponse> qr = questions.stream()
                .map(q -> new QuizQuestionResponse(
                        q.getQuestionId(),
                        q.getQuestionText(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD()
                ))
                .collect(Collectors.toList());
        return new QuizResponse(
                quiz.getQuizId(),
                quiz.getLesson().getLessonId(),
                quiz.getTitle(),
                quiz.isFinalQuiz(),
                quiz.getNumberOfQuestions(),
                qr,
                quiz.getCreatedAt(),
                quiz.getUpdatedAt()
        );
    }

    private QuizResponse mapToResponseWithoutCorrect(Quiz quiz, List<QuizQuestion> questions) {
        List<QuizQuestionResponse> qr = questions.stream()
                .map(q -> new QuizQuestionResponse(
                        q.getQuestionId(),
                        q.getQuestionText(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD()
                ))
                .collect(Collectors.toList());
        return new QuizResponse(
                quiz.getQuizId(),
                quiz.getLesson().getLessonId(),
                quiz.getTitle(),
                quiz.isFinalQuiz(),
                quiz.getNumberOfQuestions(),
                qr,
                quiz.getCreatedAt(),
                quiz.getUpdatedAt()
        );
    }
}