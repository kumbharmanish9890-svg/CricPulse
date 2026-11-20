
package com.cricpulse.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cricpulse.entity.Toss;

@Repository
public interface TossRepository extends JpaRepository<Toss, Long> {

    Optional<Toss> findByMatchId(Long matchId);

    boolean existsByMatchId(Long matchId);
}
