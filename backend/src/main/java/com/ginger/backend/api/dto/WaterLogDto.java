package com.ginger.backend.api.dto;

import java.time.Instant;

public record WaterLogDto(
        Long id,
        Long userId,
        Instant drankAt,
        Integer ml
) {}
