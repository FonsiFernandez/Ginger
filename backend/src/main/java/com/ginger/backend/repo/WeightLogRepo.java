package com.ginger.backend.repo;

import com.ginger.backend.domain.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WeightLogRepo extends JpaRepository<WeightLog, Long> {

    List<WeightLog> findTop90ByUserIdOrderByCreatedAtAsc(Long userId);

    Optional<WeightLog> findTop1ByUserIdOrderByCreatedAtDesc(Long userId);
}
