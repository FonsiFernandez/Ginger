package com.ginger.backend.api.dto;

import jakarta.validation.constraints.NotNull;

public record StartFastingRequest(
        @NotNull Long userId,
        String protocol
) {}

