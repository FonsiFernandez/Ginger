package com.ginger.backend.api.profile;

import com.ginger.backend.domain.FoodLog;
import com.ginger.backend.domain.WaterLog;
import com.ginger.backend.domain.WeightLog;
import com.ginger.backend.repo.FoodLogRepo;
import com.ginger.backend.repo.WaterLogRepo;
import com.ginger.backend.repo.WeightLogRepo;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final WeightLogRepo weightLogRepo;
    private final FoodLogRepo foodLogRepo;
    private final WaterLogRepo waterLogRepo;

    public StatsController(WeightLogRepo weightLogRepo, FoodLogRepo foodLogRepo, WaterLogRepo waterLogRepo) {
        this.weightLogRepo = weightLogRepo;
        this.foodLogRepo = foodLogRepo;
        this.waterLogRepo = waterLogRepo;
    }

    @GetMapping("/weight")
    public List<WeightLog> weightSeries(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "90") int days
    ) {
        Instant to = Instant.now();
        Instant from = to.minus(days, ChronoUnit.DAYS);
        return weightLogRepo.findByUserIdAndCreatedAtBetweenOrderByCreatedAtAsc(userId, from, to);
    }

    // ===== NUEVO 1: Totales diarios (calorías + agua) =====
    @GetMapping("/daily-totals")
    public List<DailyTotalsPoint> dailyTotals(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "Europe/Madrid") String tz
    ) {
        ZoneId zone = ZoneId.of(tz);

        Instant to = Instant.now();
        Instant from = to.minus(days, ChronoUnit.DAYS);

        List<FoodLog> foods = foodLogRepo.findByUserIdAndEatenAtBetween(userId, from, to);
        List<WaterLog> waters = waterLogRepo.findByUserIdAndDrankAtBetween(userId, from, to);

        // Agrupar por LocalDate (en tz)
        Map<LocalDate, Double> caloriesByDay = new HashMap<>();
        for (FoodLog f : foods) {
            Instant at = f.getCreatedAt(); // cambia a f.getAt() si tu campo es at
            LocalDate day = at.atZone(zone).toLocalDate();
            caloriesByDay.merge(day, safeDouble(f.getCalories()), Double::sum);
        }

        Map<LocalDate, Integer> waterByDay = new HashMap<>();
        for (WaterLog w : waters) {
            Instant at = w.getDrankAt(); // cambia a w.getAt() si tu campo es at
            LocalDate day = at.atZone(zone).toLocalDate();
            waterByDay.merge(day, safeInt(w.getMl()), Integer::sum);
        }

        // Generar lista continua de días (para que la gráfica no “salte”)
        LocalDate end = Instant.now().atZone(zone).toLocalDate();
        LocalDate start = end.minusDays(days - 1);

        List<DailyTotalsPoint> out = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            double cals = caloriesByDay.getOrDefault(d, 0.0);
            int ml = waterByDay.getOrDefault(d, 0);
            out.add(new DailyTotalsPoint(d.toString(), cals, ml));
        }

        return out;
    }

    // ===== NUEVO 2: Calorías por hora del día =====
    @GetMapping("/calories-by-hour")
    public List<HourCaloriesPoint> caloriesByHour(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "14") int days,
            @RequestParam(defaultValue = "Europe/Madrid") String tz
    ) {
        ZoneId zone = ZoneId.of(tz);

        Instant to = Instant.now();
        Instant from = to.minus(days, ChronoUnit.DAYS);

        List<FoodLog> foods = foodLogRepo.findByUserIdAndEatenAtBetween(userId, from, to);

        double[] buckets = new double[24];
        for (FoodLog f : foods) {
            Instant at = f.getCreatedAt(); // cambia a f.getAt() si tu campo es at
            int hour = at.atZone(zone).getHour();
            buckets[hour] += safeDouble(f.getCalories());
        }

        List<HourCaloriesPoint> out = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            out.add(new HourCaloriesPoint(h, buckets[h]));
        }
        return out;
    }

    private static double safeDouble(Double v) { return v == null ? 0.0 : v; }
    private static int safeInt(Integer v) { return v == null ? 0 : v; }
}
