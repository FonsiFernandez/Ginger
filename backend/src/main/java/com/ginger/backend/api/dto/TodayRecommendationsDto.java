package com.ginger.backend.api.dto;

import java.util.List;

public record TodayRecommendationsDto(
        Long userId,
        String date,
        List<String> messages
) {}
