export type DailyTargetsDto = {
    calorieTargetKcal: number | null;
    proteinTargetG: number | null;
    sugarLimitG: number | null;
    waterGoalMl: number | null;
};

export type DailyProgressDto = {
    calories: number;
    proteinG: number;
    sugarG: number;
    waterMl: number;
};

export type TodaySummaryDto = {
    userId: number;
    date: string;
    targets: DailyTargetsDto;
    consumed: DailyProgressDto;
    fastingActive: boolean;
    fastingProtocol: string | null;
    activeFastingId: number | null;
};

export type UserDto = {
    id: number;
    name: string;
    age?: number | null;
    heightCm?: number | null;
    weightKg?: number | null;

    goalMode?: string | null;
    calorieTargetKcal?: number | null;
    proteinTargetG?: number | null;
    sugarLimitG?: number | null;
    waterGoalMl?: number | null;
    fastingDefaultHours?: number | null;
};

export type Sex = "MALE" | "FEMALE";
export type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "HIGH" | "VERY_HIGH";
export type Goal = "LOSE" | "MAINTAIN" | "GAIN";
export type GoalPace = "MILD" | "MEDIUM" | "AGGRESSIVE";

export type OnboardingRequest = {
    age: number;
    sex: Sex;
    heightCm: number;
    weightKg: number;
    activityLevel: ActivityLevel;
    goal: Goal;
    goalPace: GoalPace;
};

