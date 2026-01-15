package com.ginger.backend.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateWaterLogRequest(
        @NotNull Long userId,
        @Min(1) Integer ml
) {}

