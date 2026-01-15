package com.ginger.backend.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ParseMealRequest(
        @NotNull Long userId,
        @NotBlank String text
) {}
