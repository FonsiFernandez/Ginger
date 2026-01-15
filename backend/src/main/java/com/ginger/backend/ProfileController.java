package com.ginger.backend;

import com.ginger.backend.api.profile.OnboardingRequest;
import com.ginger.backend.domain.UserProfile;
import com.ginger.backend.repo.UserProfileRepo;
import com.ginger.backend.service.ProfileCalculatorService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class ProfileController {

    private final UserProfileRepo userProfileRepo;
    private final ProfileCalculatorService profileCalculatorService;

    public ProfileController(UserProfileRepo userProfileRepo,
                             ProfileCalculatorService profileCalculatorService) {
        this.userProfileRepo = userProfileRepo;
        this.profileCalculatorService = profileCalculatorService;
    }

    @PostMapping("/{userId}/onboarding")
    public UserProfile saveOnboarding(@PathVariable long userId,
                                      @RequestBody OnboardingRequest r) {

        UserProfile u = userProfileRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("UserProfile not found: " + userId));

        // Guardar inputs
        u.setAge(r.age);
        u.setHeightCm(r.heightCm);
        u.setWeightKg(r.weightKg);
        u.setSex(r.sex);
        u.setActivityLevel(r.activityLevel);
        u.setGoal(r.goal);
        u.setGoalPace(r.goalPace);

        // Calcular targets usando tu service
        int calorieTarget = ProfileCalculatorService.calculateCalorieTarget(r);
        int waterGoal = ProfileCalculatorService.calculateWaterGoalMl(r.weightKg);

        u.setCalorieTargetKcal(calorieTarget);
        u.setWaterGoalMl(waterGoal);

        return userProfileRepo.save(u);
    }
}
