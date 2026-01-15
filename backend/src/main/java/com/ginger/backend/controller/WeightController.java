package com.ginger.backend.api.profile;

import com.ginger.backend.domain.UserProfile;
import com.ginger.backend.domain.WeightLog;
import com.ginger.backend.repo.UserProfileRepo;
import com.ginger.backend.repo.WeightLogRepo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weight")
public class WeightController {

    private final WeightLogRepo weightLogRepo;
    private final UserProfileRepo userProfileRepo;

    public WeightController(WeightLogRepo weightLogRepo, UserProfileRepo userProfileRepo) {
        this.weightLogRepo = weightLogRepo;
        this.userProfileRepo = userProfileRepo;
    }

    public static class AddWeightRequest {
        public Long userId;
        public Double weightKg;
    }

    @PostMapping
    public WeightLog add(@RequestBody AddWeightRequest r) {
        if (r.userId == null || r.weightKg == null) {
            throw new RuntimeException("userId and weightKg are required");
        }

        // 1) insertar en histórico
        WeightLog saved = weightLogRepo.save(
                WeightLog.builder()
                        .userId(r.userId)
                        .weightKg(r.weightKg)
                        .build()
        );

        // 2) actualizar peso actual en perfil
        UserProfile u = userProfileRepo.findById(r.userId)
                .orElseThrow(() -> new RuntimeException("UserProfile not found: " + r.userId));

        u.setWeightKg(r.weightKg);
        userProfileRepo.save(u);

        return saved;
    }

    @GetMapping
    public List<WeightLog> list(@RequestParam Long userId) {
        return weightLogRepo.findTop90ByUserIdOrderByCreatedAtAsc(userId);
    }
}
