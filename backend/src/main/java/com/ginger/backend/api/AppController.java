package com.ginger.backend.api;

import com.ginger.backend.api.dto.*;
import com.ginger.backend.domain.*;
import com.ginger.backend.repo.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

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

    // ---- Users ----

    @GetMapping("/users")
    public List<UserProfile> listUsers() {
        return userRepo.findAll();
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserProfile createUser(@Valid @RequestBody CreateUserRequest req) {
        var u = UserProfile.builder()
                .name(req.name())
                .age(req.age())
                .heightCm(req.heightCm())
                .weightKg(req.weightKg())
                .build();
        return userRepo.save(u);
    }

    // ---- Food ----

    @PostMapping("/food")
    @ResponseStatus(HttpStatus.CREATED)
    public FoodLog addFood(@Valid @RequestBody CreateFoodLogRequest req) {
        var user = userRepo.findById(req.userId()).orElseThrow();
        var log = FoodLog.builder()
                .user(user)
                .eatenAt(Instant.now())
                .description(req.description())
                .calories(req.calories())
                .proteinG(req.proteinG())
                .carbsG(req.carbsG())
                .fatG(req.fatG())
                .build();
        return foodRepo.save(log);
    }

    // ---- Water ----

    @PostMapping("/water")
    @ResponseStatus(HttpStatus.CREATED)
    public WaterLog addWater(@Valid @RequestBody CreateWaterLogRequest req) {
        var user = userRepo.findById(req.userId()).orElseThrow();
        var log = WaterLog.builder()
                .user(user)
                .drankAt(Instant.now())
                .ml(req.ml())
                .build();
        return waterRepo.save(log);
    }

    // ---- Fasting ----

    @PostMapping("/fasting/start")
    @ResponseStatus(HttpStatus.CREATED)
    public FastingSession startFasting(@Valid @RequestBody StartFastingRequest req) {
        var user = userRepo.findById(req.userId()).orElseThrow();

        fastingRepo.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(req.userId())
                .ifPresent(active -> { throw new IllegalStateException("User already has an active fasting session"); });

        var session = FastingSession.builder()
                .user(user)
                .startedAt(Instant.now())
                .protocol(req.protocol() == null ? "custom" : req.protocol())
                .build();

        return fastingRepo.save(session);
    }

    @PostMapping("/fasting/stop")
    public FastingSession stopFasting(@RequestParam Long userId) {
        var active = fastingRepo.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(userId)
                .orElseThrow(() -> new IllegalStateException("No active fasting session"));

        active.setEndedAt(Instant.now());
        return fastingRepo.save(active);
    }
}

