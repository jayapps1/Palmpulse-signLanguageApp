package com.aisignapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lesson_sign")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonSign {

    @EmbeddedId
    private LessonSignId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("lessonId")
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("signId")
    @JoinColumn(name = "sign_id")
    private Sign sign;
}