package com.ginger.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "weight_log")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WeightLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // MVP: guardamos userId directo (sin relación JPA para evitar líos)
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Double weightKg;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
