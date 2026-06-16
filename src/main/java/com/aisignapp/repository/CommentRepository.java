package com.aisignapp.repository;

import com.aisignapp.entity.Comment;
import com.aisignapp.entity.User;
import com.aisignapp.entity.Lesson;
import com.aisignapp.entity.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByUserOrderByCreatedAtDesc(User user);
    List<Comment> findByLesson(Lesson lesson);
    List<Comment> findByTranslation(Translation translation);
}