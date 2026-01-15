package com.ginger.backend.api.dto;

public record FastingStatusDto(
        Long userId,
        boolean active,
        Long sessionId,
        String protocol,
        long minutesFasted,
        String suggestion
) {}
