package com.ginger.backend.api.dto;

import java.time.Instant;

public record FoodLogDto(
        Long id,
        Long userId,
        String description,
        Double calories,
        Double proteinG,
        Double carbsG,
        Double fatG,
        Double sugarG,
        Instant eatenAt
) {}
