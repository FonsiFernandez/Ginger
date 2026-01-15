package com.ginger.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "food_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FoodLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile user;

    @Column(nullable = false)
    private Instant eatenAt;

    @Column(nullable = false)
    private String description; // “arroz con pollo”

    private Double calories;
    private Double proteinG;
    private Double carbsG;
    private Double fatG;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (eatenAt == null) eatenAt = Instant.now();
    }
}
