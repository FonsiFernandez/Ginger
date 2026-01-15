package com.ginger.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "water_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WaterLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile user;

    @Column(nullable = false)
    private Instant drankAt;

    @Column(nullable = false)
    private Integer ml; // mililitros

    @PrePersist
    void prePersist() {
        if (drankAt == null) drankAt = Instant.now();
    }
}
