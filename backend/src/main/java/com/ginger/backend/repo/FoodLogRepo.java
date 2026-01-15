package com.ginger.backend.repo;

import com.ginger.backend.domain.FoodLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface FoodLogRepo extends JpaRepository<FoodLog, Long> {

    List<FoodLog> findByUserIdAndEatenAtBetween(Long userId, Instant from, Instant to);

    @Query("""
    select coalesce(sum(f.calories), 0)
    from FoodLog f
    where f.user.id = :userId and f.eatenAt between :from and :to
  """)
    Optional<Double> sumCaloriesBetween(@Param("userId") Long userId, @Param("from") Instant from, @Param("to") Instant to);

}

