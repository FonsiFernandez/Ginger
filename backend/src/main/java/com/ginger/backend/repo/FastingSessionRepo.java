package com.ginger.backend.repo;

import com.ginger.backend.domain.FastingSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FastingSessionRepo extends JpaRepository<FastingSession, Long> {
    Optional<FastingSession> findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(Long userId);
}
