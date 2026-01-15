package com.ginger.backend.api.profile;

public class HourCaloriesPoint {
    public int hour;       // 0-23
    public double calories;

    public HourCaloriesPoint(int hour, double calories) {
        this.hour = hour;
        this.calories = calories;
    }
}
