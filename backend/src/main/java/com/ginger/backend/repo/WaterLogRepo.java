package com.ginger.backend.repo;

import com.ginger.backend.domain.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface WaterLogRepo extends JpaRepository<WaterLog, Long> {
    List<WaterLog> findByUserIdAndDrankAtBetween(Long userId, Instant from, Instant to);
}
