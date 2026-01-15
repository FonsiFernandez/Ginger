package com.ginger.backend.api.dto;

public record TodaySummaryDto(
        Long userId,
        String date,            // "2026-01-15" (fecha local del servidor)
        double caloriesToday,
        int waterMlToday,
        boolean fastingActive,
        String fastingProtocol,
        Long activeFastingId
) {}
