package com.ginger.backend.api.profile;

public class DailyTotalsPoint {
    public String date;      // "2026-01-15"
    public double calories;  // total del día
    public int waterMl;      // total del día

    public DailyTotalsPoint(String date, double calories, int waterMl) {
        this.date = date;
        this.calories = calories;
        this.waterMl = waterMl;
    }
}
