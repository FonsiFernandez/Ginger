package com.ginger.backend.api.dto;

public record UserDto(
        Long id,
        String name,
        Integer age,
        Double heightCm,
        Double weightKg
) {}
