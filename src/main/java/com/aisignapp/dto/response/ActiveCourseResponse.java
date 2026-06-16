package com.aisignapp.dto.response;

import com.aisignapp.entity.enums.BadgeLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ActiveCourseResponse {
    private CourseResponse course;
    private BadgeLevel badge;
    private String enrollmentStatus;
}