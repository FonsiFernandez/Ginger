package com.ginger.backend.service;

import com.ginger.backend.api.profile.*;
import org.springframework.stereotype.Service;

@Service
public class ProfileCalculatorService {

    public static int calculateBmr(int age, double heightCm, double weightKg, Sex sex) {
        // Mifflin-St Jeor
        double bmr = 10.0 * weightKg + 6.25 * heightCm - 5.0 * age + (sex == Sex.MALE ? 5 : -161);
        return (int) Math.round(bmr);
    }

    public static double activityFactor(ActivityLevel level) {
        return switch (level) {
            case SEDENTARY -> 1.20;
            case LIGHT -> 1.375;
            case MODERATE -> 1.55;
            case HIGH -> 1.725;
            case VERY_HIGH -> 1.90;
        };
    }

    public static int goalDelta(Goal goal, GoalPace pace) {
        if (goal == Goal.MAINTAIN) return 0;

        if (goal == Goal.LOSE) {
            return switch (pace) {
                case MILD -> -250;
                case MEDIUM -> -500;
                case AGGRESSIVE -> -750;
            };
        }

        // GAIN
        return switch (pace) {
            case MILD -> 250;
            case MEDIUM -> 400;
            case AGGRESSIVE -> 600;
        };
    }

    public static int calculateCalorieTarget(OnboardingRequest r) {
        int bmr = calculateBmr(r.age, r.heightCm, r.weightKg, r.sex);
        int tdee = (int) Math.round(bmr * activityFactor(r.activityLevel));
        int target = tdee + goalDelta(r.goal, r.goalPace);

        // límites básicos para no irte a 0 por error
        if (target < 1200) target = 1200;
        return target;
    }

    public static int calculateWaterGoalMl(double weightKg) {
        // regla simple: 35 ml por kg (aprox)
        int ml = (int) Math.round(weightKg * 35.0);
        // límites razonables
        if (ml < 1500) ml = 1500;
        if (ml > 4500) ml = 4500;
        return ml;
    }
}

