package com.ginger.backend.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateWaterGoalRequest(
        @NotNull Long userId,
        @NotNull @Min(500) @Max(8000) Integer waterGoalMl
) {}
