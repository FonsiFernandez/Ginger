package com.ginger.backend.service;

import com.ginger.backend.api.dto.TodayRecommendationsDto;
import com.ginger.backend.domain.FastingSession;
import com.ginger.backend.repo.FastingSessionRepo;
import com.ginger.backend.repo.FoodLogRepo;
import com.ginger.backend.repo.UserProfileRepo;
import com.ginger.backend.repo.WaterLogRepo;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationsService {

    private final UserProfileRepo userRepo;
    private final FoodLogRepo foodRepo;
    private final WaterLogRepo waterRepo;
    private final FastingSessionRepo fastingRepo;

    public RecommendationsService(UserProfileRepo userRepo, FoodLogRepo foodRepo, WaterLogRepo waterRepo, FastingSessionRepo fastingRepo) {
        this.userRepo = userRepo;
        this.foodRepo = foodRepo;
        this.waterRepo = waterRepo;
        this.fastingRepo = fastingRepo;
    }

    public TodayRecommendationsDto today(Long userId) {
        var user = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        ZoneId zone = ZoneId.systemDefault();
        LocalDate date = LocalDate.now(zone);
        Instant from = date.atStartOfDay(zone).toInstant();
        Instant now = Instant.now();

        double caloriesToday = foodRepo.sumCaloriesBetween(userId, from, now).orElse(0.0);
        int waterMlToday = waterRepo.sumWaterBetween(userId, from, now).orElse(0);

        Integer goal = user.getWaterGoalMl();
        if (goal == null) goal = 2000;

        var msgs = new ArrayList<String>();

        // Agua
        int remaining = Math.max(0, goal - waterMlToday);
        if (remaining == 0) {
            msgs.add("Agua: objetivo cumplido hoy. Mantén el ritmo.");
        } else if (remaining <= 300) {
            msgs.add("Agua: te falta poco para el objetivo (" + remaining + " ml). Un vaso más y listo.");
        } else {
            msgs.add("Agua: te faltan " + remaining + " ml para el objetivo de " + goal + " ml.");
        }

        // Calorías (sin objetivo todavía, mensajes suaves)
        if (caloriesToday == 0) {
            msgs.add("Comida: aún no has registrado calorías hoy. Si ya comiste, añade una entrada.");
        } else if (caloriesToday < 400) {
            msgs.add("Comida: llevas " + Math.round(caloriesToday) + " kcal. Si te toca comer, prioriza proteína + fibra.");
        } else {
            msgs.add("Comida: llevas " + Math.round(caloriesToday) + " kcal registradas hoy.");
        }

        // Ayuno
        var active = fastingRepo.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(userId);
        if (active.isPresent()) {
            FastingSession s = active.get();
            long minutes = Duration.between(s.getStartedAt(), now).toMinutes();
            msgs.add(buildFastingSuggestion(s.getProtocol(), minutes));
        } else {
            msgs.add("Ayuno: no hay sesión activa. Si quieres, inicia una con el protocolo que prefieras (ej. 16:8).");
        }

        return new TodayRecommendationsDto(userId, date.toString(), List.copyOf(msgs));
    }

    public static String buildFastingSuggestion(String protocol, long minutesFasted) {
        String p = (protocol == null || protocol.isBlank()) ? "custom" : protocol;

        if (minutesFasted < 60) {
            return "Ayuno (" + p + "): buen inicio. Mantente hidratado y evita calorías.";
        }
        if (minutesFasted < 8 * 60) {
            return "Ayuno (" + p + "): vas bien. Prioriza hidratación; si entrenas, baja intensidad si lo necesitas.";
        }
        if (minutesFasted < 12 * 60) {
            return "Ayuno (" + p + "): ventana común. Si tienes hambre, agua con gas o infusiones pueden ayudar.";
        }
        if (minutesFasted < 16 * 60) {
            return "Ayuno (" + p + "): cerca de 16h. Cuando rompas, empieza con algo ligero y proteína.";
        }
        return "Ayuno (" + p + "): ventana larga. Si rompes, evita un atracón: proteína + fibra + grasa saludable.";
    }

}
