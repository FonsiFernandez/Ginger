package com.ginger.backend.api.dto;

public record LogMealResponse(
        FoodLogDto foodLog,
        ParseMealResponse ai
) {}
