package com.ginger.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateFoodLogRequest(
        Long userId,
        @NotBlank String description,
        Double calories,
        Double proteinG,
        Double carbsG,
        Double fatG
) {}
