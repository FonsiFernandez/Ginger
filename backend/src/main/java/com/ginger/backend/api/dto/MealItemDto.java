package com.ginger.backend.api.dto;

public record MealItemDto(
        String name,
        String quantity,
        Double calories,
        Double proteinG,
        Double carbsG,
        Double fatG
) {}
