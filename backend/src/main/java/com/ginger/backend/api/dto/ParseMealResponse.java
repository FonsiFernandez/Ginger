package com.ginger.backend.api.dto;

import java.util.List;

public record ParseMealResponse(
        String description,
        Double totalCalories,
        Double totalProteinG,
        Double totalCarbsG,
        Double totalFatG,
        List<MealItemDto> items
) {}
