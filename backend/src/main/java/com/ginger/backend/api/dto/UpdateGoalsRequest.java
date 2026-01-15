package com.ginger.backend.api.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateGoalsRequest(
        @NotNull Long userId,
        String goalMode,
        Integer calorieTargetKcal,
        Integer proteinTargetG,
        Integer sugarLimitG,
        Integer waterGoalMl,
        Integer fastingDefaultHours
) {}
