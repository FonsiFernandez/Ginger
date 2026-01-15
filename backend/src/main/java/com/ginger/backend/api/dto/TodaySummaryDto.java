package com.ginger.backend.api.dto;

public record TodaySummaryDto(
        Long userId,
        String date,
        double caloriesToday,
        int waterMlToday,
        Integer waterGoalMl,
        boolean fastingActive,
        String fastingProtocol,
        Long activeFastingId
) {}
