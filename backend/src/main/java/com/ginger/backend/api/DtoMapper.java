package com.ginger.backend.api;

import com.ginger.backend.api.dto.*;
import com.ginger.backend.domain.*;

public class DtoMapper {

    public static UserDto toDto(UserProfile u) {
        return new UserDto(u.getId(), u.getName(), u.getAge(), u.getHeightCm(), u.getWeightKg());
    }

    public static FoodLogDto toDto(FoodLog f) {
        return new FoodLogDto(
                f.getId(),
                f.getUser().getId(),
                f.getEatenAt(),
                f.getDescription(),
                f.getCalories(),
                f.getProteinG(),
                f.getCarbsG(),
                f.getFatG()
        );
    }

    public static WaterLogDto toDto(WaterLog w) {
        return new WaterLogDto(
                w.getId(),
                w.getUser().getId(),
                w.getDrankAt(),
                w.getMl()
        );
    }

    public static FastingSessionDto toDto(FastingSession s) {
        return new FastingSessionDto(
                s.getId(),
                s.getUser().getId(),
                s.getStartedAt(),
                s.getEndedAt(),
                s.getProtocol()
        );
    }
}

