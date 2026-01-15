package com.ginger.backend.repo;

import com.ginger.backend.domain.FoodLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface FoodLogRepo extends JpaRepository<FoodLog, Long> {
    List<FoodLog> findByUserIdAndEatenAtBetween(Long userId, Instant from, Instant to);
}

