package com.ginger.backend.api.dto;

public record DailyProgressDto(
        double calories,
        double proteinG,
        double sugarG,
        int waterMl
) {}
