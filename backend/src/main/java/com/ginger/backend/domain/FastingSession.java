package com.ginger.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "fasting_sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FastingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile user;

    @Column(nullable = false)
    private Instant startedAt;

    private Instant endedAt; // null = sigue activo

    private String protocol; // "16:8", "14:10", "custom"

    @PrePersist
    void prePersist() {
        if (startedAt == null) startedAt = Instant.now();
    }
}
