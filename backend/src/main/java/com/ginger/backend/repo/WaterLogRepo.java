package com.ginger.backend.repo;

import com.ginger.backend.domain.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface WaterLogRepo extends JpaRepository<WaterLog, Long> {
    List<WaterLog> findByUserIdAndDrankAtBetween(Long userId, Instant from, Instant to);

    @Query("""
    select coalesce(sum(w.ml), 0)
    from WaterLog w
    where w.user.id = :userId and w.drankAt between :from and :to
  """)
    int sumWaterBetween(@Param("userId") Long userId, @Param("from") Instant from, @Param("to") Instant to);
}
