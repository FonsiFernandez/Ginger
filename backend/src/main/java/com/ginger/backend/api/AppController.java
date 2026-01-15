package com.ginger.backend.api;

import com.ginger.backend.api.dto.*;
import com.ginger.backend.domain.*;
import com.ginger.backend.repo.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.List;

import static com.ginger.backend.api.DtoMapper.*;

@RestController
@RequestMapping("/api")
public class AppController {

    private final UserProfileRepo userRepo;
    private final FoodLogRepo foodRepo;
    private final WaterLogRepo waterRepo;
    private final FastingSessionRepo fastingRepo;

    public AppController(UserProfileRepo userRepo, FoodLogRepo foodRepo, WaterLogRepo waterRepo, FastingSessionRepo fastingRepo) {
        this.userRepo = userRepo;
        this.foodRepo = foodRepo;
        this.waterRepo = waterRepo;
        this.fastingRepo = fastingRepo;
    }

    // ---------------- Users ----------------

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userRepo.findAll().stream().map(DtoMapper::toDto).toList();
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@Valid @RequestBody CreateUserRequest req) {
        var u = UserProfile.builder()
                .name(req.name())
                .age(req.age())
                .heightCm(req.heightCm())
                .weightKg(req.weightKg())
                .build();

        return toDto(userRepo.save(u));
    }

    // ---------------- Food ----------------

    @PostMapping("/food")
    @ResponseStatus(HttpStatus.CREATED)
    public FoodLogDto addFood(@Valid @RequestBody CreateFoodLogRequest req) {
        var user = userRepo.findById(req.userId()).orElseThrow(() -> new IllegalArgumentException("User not found"));

        var log = FoodLog.builder()
                .user(user)
                .eatenAt(Instant.now())
                .description(req.description())
                .calories(req.calories())
                .proteinG(req.proteinG())
                .carbsG(req.carbsG())
                .fatG(req.fatG())
                .build();

        return toDto(foodRepo.save(log));
    }

    // ---------------- Water ----------------

    @PostMapping("/water")
    @ResponseStatus(HttpStatus.CREATED)
    public WaterLogDto addWater(@Valid @RequestBody CreateWaterLogRequest req) {
        var user = userRepo.findById(req.userId()).orElseThrow(() -> new IllegalArgumentException("User not found"));

        var log = WaterLog.builder()
                .user(user)
                .drankAt(Instant.now())
                .ml(req.ml())
                .build();

        return toDto(waterRepo.save(log));
    }

    // ---------------- Fasting ----------------

    @PostMapping("/fasting/start")
    @ResponseStatus(HttpStatus.CREATED)
    public FastingSessionDto startFasting(@Valid @RequestBody StartFastingRequest req) {
        var user = userRepo.findById(req.userId()).orElseThrow(() -> new IllegalArgumentException("User not found"));

        fastingRepo.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(req.userId())
                .ifPresent(active -> { throw new IllegalStateException("User already has an active fasting session"); });

        var session = FastingSession.builder()
                .user(user)
                .startedAt(Instant.now())
                .protocol(req.protocol() == null || req.protocol().isBlank() ? "custom" : req.protocol())
                .build();

        return toDto(fastingRepo.save(session));
    }

    @PostMapping("/fasting/stop")
    public FastingSessionDto stopFasting(@RequestParam Long userId) {
        var active = fastingRepo.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(userId)
                .orElseThrow(() -> new IllegalStateException("No active fasting session"));

        active.setEndedAt(Instant.now());
        return toDto(fastingRepo.save(active));
    }

    // ---------------- Summary (Today) ----------------

    @GetMapping("/summary/today")
    public TodaySummaryDto today(@RequestParam Long userId) {
        // “hoy” según zona local del servidor (en tu caso, Europa/Berlin normalmente)
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        Instant from = today.atStartOfDay(zone).toInstant();
        Instant to = today.plusDays(1).atStartOfDay(zone).toInstant();

        double calories = foodRepo.sumCaloriesBetween(userId, from, to);
        int waterMl = waterRepo.sumWaterBetween(userId, from, to);

        var active = fastingRepo.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(userId);

        return new TodaySummaryDto(
                userId,
                today.toString(),
                calories,
                waterMl,
                active.isPresent(),
                active.map(FastingSession::getProtocol).orElse(null),
                active.map(FastingSession::getId).orElse(null)
        );
    }
}
