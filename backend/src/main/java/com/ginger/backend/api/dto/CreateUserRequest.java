package com.ginger.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
        @NotBlank String name,
        Integer age,
        Double heightCm,
        Double weightKg
) {}
