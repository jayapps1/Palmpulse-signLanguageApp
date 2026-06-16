package com.aisignapp.repository;

import com.aisignapp.entity.LessonSign;
import com.aisignapp.entity.LessonSignId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonSignRepository extends JpaRepository<LessonSign, LessonSignId> {
    List<LessonSign> findByLesson_LessonId(Long lessonId);
    List<LessonSign> findBySign_SignId(Long signId);
    void deleteByLesson_LessonIdAndSign_SignId(Long lessonId, Long signId);
    void deleteByLesson_LessonId(Long lessonId);
}