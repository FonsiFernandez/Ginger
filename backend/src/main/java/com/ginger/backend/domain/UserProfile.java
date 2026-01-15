package com.ginger.backend.domain;

import com.ginger.backend.api.profile.ActivityLevel;
import com.ginger.backend.api.profile.Goal;
import com.ginger.backend.api.profile.GoalPace;
import com.ginger.backend.api.profile.Sex;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    // opcional: para calcular objetivos
    private Integer age;
    private Double heightCm;
    private Double weightKg;

    @Enumerated(EnumType.STRING)
    private Sex sex;

    @Enumerated(EnumType.STRING)
    private ActivityLevel activityLevel;

    @Enumerated(EnumType.STRING)
    private Goal goal;

    @Enumerated(EnumType.STRING)
    private GoalPace goalPace;

    // Goals
    private String goalMode;
    private Integer calorieTargetKcal;
    private Integer proteinTargetG;
    private Integer sugarLimitG;
    private Integer waterGoalMl;
    private Integer fastingDefaultHours;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}

