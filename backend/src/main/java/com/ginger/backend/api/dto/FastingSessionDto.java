package com.ginger.backend.api.dto;

import java.time.Instant;

public record FastingSessionDto(
        Long id,
        Long userId,
        Instant startedAt,
        Instant endedAt,
        String protocol
) {}