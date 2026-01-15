package com.ginger.backend.api;

import com.ginger.backend.api.dto.*;
import com.ginger.backend.domain.*;
import com.ginger.backend.repo.*;
import com.ginger.backend.service.RecommendationsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.List;

import static com.ginger.backend.api.DtoMapper.*;
import static com.ginger.backend.service.RecommendationsService.buildFastingSuggestion;

@RestController
@RequestMapping("/api")
public class AppController {

    private final UserProfileRepo userRepo;
    private final FoodLogRepo foodRepo;
    private final WaterLogRepo waterRepo;
    private final FastingSessionRepo fastingRepo;
    private final RecommendationsService recService;

    public AppController(UserProfileRepo userRepo, FoodLogRepo foodRepo, WaterLogRepo waterRepo, FastingSessionRepo fastingRepo, RecommendationsService recService) {
        this.userRepo = userRepo;
        this.foodRepo = foodRepo;
        this.waterRepo = waterRepo;
        this.fastingRepo = fastingRepo;
        this.recService = recService;
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

    @PostMapping("/goals")
    public UserDto updateGoals(@Valid @RequestBody UpdateGoalsRequest req) {
        var user = userRepo.findById(req.userId()).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (req.goalMode() != null) user.setGoalMode(req.goalMode());
        if (req.calorieTargetKcal() != null) user.setCalorieTargetKcal(req.calorieTargetKcal());
        if (req.proteinTargetG() != null) user.setProteinTargetG(req.proteinTargetG());
        if (req.sugarLimitG() != null) user.setSugarLimitG(req.sugarLimitG());
        if (req.waterGoalMl() != null) user.setWaterGoalMl(req.waterGoalMl());
        if (req.fastingDefaultHours() != null) user.setFastingDefaultHours(req.fastingDefaultHours());

        return toDto(userRepo.save(user));
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

    @PostMapping("/water/goal")
    public UserDto updateWaterGoal(@Valid @RequestBody UpdateWaterGoalRequest req) {
        var user = userRepo.findById(req.userId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setWaterGoalMl(req.waterGoalMl());
        return DtoMapper.toDto(userRepo.save(user));
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

    @GetMapping("/fasting/status")
    public FastingStatusDto fastingStatus(@RequestParam Long userId) {
        var user = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        var active = fastingRepo.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(userId);

        if (active.isEmpty()) {
            return new FastingStatusDto(
                    userId,
                    false,
                    null,
                    null,
                    0,
                    "No hay ayuno activo. Si quieres, inicia uno con /fasting/start."
            );
        }

        var session = active.get();
        long minutes = java.time.Duration.between(session.getStartedAt(), Instant.now()).toMinutes();

        String protocol = session.getProtocol() == null ? "custom" : session.getProtocol();

        String suggestion = buildFastingSuggestion(protocol, minutes);

        return new FastingStatusDto(
                userId,
                true,
                session.getId(),
                protocol,
                minutes,
                suggestion
        );
    }

    // ---------------- Summary (Today) ----------------

    @GetMapping("/summary/today")
    public TodaySummaryDto todaySummary(@RequestParam Long userId) {
        var user = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        ZoneId zone = ZoneId.systemDefault();
        Instant todayStart = LocalDate.now(zone).atStartOfDay(zone).toInstant();
        Instant now = Instant.now();

        double caloriesToday = foodRepo.sumCaloriesBetween(userId, todayStart, now).orElse(0.0);
        double proteinToday = foodRepo.sumProteinBetween(userId, todayStart, now).orElse(0.0);
        double sugarToday = foodRepo.sumSugarBetween(userId, todayStart, now).orElse(0.0);

        int waterMlToday = waterRepo.sumWaterBetween(userId, todayStart, now).orElse(0);

        Integer waterGoal = user.getWaterGoalMl();
        if (waterGoal == null) waterGoal = 2000;

        DailyTargetsDto targets = new DailyTargetsDto(
                user.getCalorieTargetKcal(),
                user.getProteinTargetG(),
                user.getSugarLimitG(),
                waterGoal
        );

        DailyProgressDto consumed = new DailyProgressDto(
                caloriesToday,
                proteinToday,
                sugarToday,
                waterMlToday
        );

        var activeFasting = fastingRepo.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(userId);

        return new TodaySummaryDto(
                userId,
                LocalDate.now(zone).toString(),
                targets,
                consumed,
                activeFasting.isPresent(),
                activeFasting.map(FastingSession::getProtocol).orElse(null),
                activeFasting.map(FastingSession::getId).orElse(null)
        );
    }


    // ---------------- Recommendations ----------------

    @GetMapping("/recommendations/today")
    public TodayRecommendationsDto todayRecommendations(@RequestParam Long userId) {
        return recService.today(userId);
    }
}
