package com.ginger.backend.api.dto;

public record DailyTargetsDto(
        Integer calorieTargetKcal,
        Integer proteinTargetG,
        Integer sugarLimitG,
        Integer waterGoalMl,
        Double carbsGTarget
) {}