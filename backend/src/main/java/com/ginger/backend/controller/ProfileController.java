package com.ginger.backend.controller;

import com.ginger.backend.api.profile.OnboardingRequest;
import com.ginger.backend.domain.UserProfile;
import com.ginger.backend.repo.UserProfileRepo;
import com.ginger.backend.repo.WeightLogRepo;
import com.ginger.backend.service.ProfileCalculatorService;
import org.springframework.web.bind.annotation.*;
import com.ginger.backend.domain.WeightLog;


@RestController
@RequestMapping("/api/users")
public class ProfileController {

    private final UserProfileRepo userProfileRepo;
    private final ProfileCalculatorService profileCalculatorService;
    private final WeightLogRepo weightLogRepo;

    public ProfileController(UserProfileRepo userProfileRepo,
                             ProfileCalculatorService profileCalculatorService, WeightLogRepo weightLogRepo) {
        this.userProfileRepo = userProfileRepo;
        this.profileCalculatorService = profileCalculatorService;
        this.weightLogRepo = weightLogRepo;
    }

    @PostMapping("/{userId}/onboarding")
    public UserProfile saveOnboarding(@PathVariable long userId,
                                      @RequestBody OnboardingRequest r) {

        UserProfile u = userProfileRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("UserProfile not found: " + userId));

        // Guardar inputs
        u.setAge(r.age);
        u.setHeightCm(r.heightCm);
        if (r.weightKg != null && !r.weightKg.equals(u.getWeightKg())) {
            u.setWeightKg(r.weightKg);
            weightLogRepo.save(
                    WeightLog.builder()
                            .userId(u.getId())
                            .weightKg(r.weightKg)
                            .build()
            );
        }
        u.setSex(r.sex);
        u.setActivityLevel(r.activityLevel);
        u.setGoal(r.goal);
        u.setGoalPace(r.goalPace);

        profileCalculatorService.recalcAndApply(u);

        return userProfileRepo.save(u);
    }

    @GetMapping("/{userId}")
    public UserProfile getUser(@PathVariable long userId) {
        return userProfileRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("UserProfile not found: " + userId));
    }

}
