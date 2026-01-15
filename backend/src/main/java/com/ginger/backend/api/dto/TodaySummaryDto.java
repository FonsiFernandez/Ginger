package com.ginger.backend.api.dto;

public record TodaySummaryDto(
        Long userId,
        String date,
        DailyTargetsDto targets,
        DailyProgressDto consumed,
        boolean fastingActive,
        String fastingProtocol,
        Long activeFastingId
) {}
