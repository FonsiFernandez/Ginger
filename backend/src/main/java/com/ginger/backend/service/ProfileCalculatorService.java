package com.ginger.backend.service;

import com.ginger.backend.api.profile.*;
import com.ginger.backend.domain.UserProfile;
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

    public static int calculateCalorieTarget(UserProfile u) {
        int bmr = calculateBmr(u.getAge(), u.getHeightCm(), u.getWeightKg(), u.getSex());
        int tdee = (int) Math.round(bmr * activityFactor(u.getActivityLevel()));
        int target = tdee + goalDelta(u.getGoal(), u.getGoalPace());

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

    public static int calculateProteinTarget(UserProfile u) {
        if (u.getWeightKg() == null) return 120; // default seguro

        double kg = u.getWeightKg();

        double gramsPerKg = 1.6;

        // Ajuste por objetivo
        if (u.getGoal() != null) {
            switch (u.getGoal()) {
                case LOSE -> gramsPerKg = 2.0;
                case GAIN -> gramsPerKg = 1.8;
                case MAINTAIN -> gramsPerKg = 1.6;
            }
        }

        // Ajuste por actividad
        if (u.getActivityLevel() != null) {
            switch (u.getActivityLevel()) {
                case HIGH, VERY_HIGH -> gramsPerKg += 0.2;
            }
        }

        gramsPerKg = Math.min(gramsPerKg, 2.4);

        return (int) Math.round(kg * gramsPerKg);
    }

    public static int calculateSugarLimit(UserProfile u) {
        Integer kcal = u.getCalorieTargetKcal();
        if (kcal == null) return 30; // default seguro

        double ratio = 0.10;

        if (u.getGoal() != null && u.getGoal() == Goal.LOSE) {
            ratio = 0.05;
        }

        double sugarKcal = kcal * ratio;
        return (int) Math.round(sugarKcal / 4.0);
    }

    public void recalcAndApply(UserProfile u) {
        // Validaciones mínimas (si faltan datos, decide defaults razonables o no recalcules)
        Integer age = u.getAge();
        Double height = u.getHeightCm();
        Double weight = u.getWeightKg();

        // Si no hay datos suficientes, no rompas. Decide: o no recalculas, o aplicas defaults.
        if (weight == null || height == null || age == null) {
            // No podemos calcular bien agua/calorías. No tocamos targets.
            return;
        }

        int calorieTarget = calculateCalorieTarget(u);
        int waterGoal = calculateWaterGoalMl(weight);

        int proteinTarget = calculateProteinTarget(u);
        int sugarLimit = calculateSugarLimit(u);

        u.setCalorieTargetKcal(calorieTarget);
        u.setWaterGoalMl(waterGoal);
        u.setProteinTargetG(proteinTarget);
        u.setSugarLimitG(sugarLimit);
    }
}

