package com.cricpulse.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cricpulse.entity.Innings;

@Repository
public interface InningsRepository extends JpaRepository<Innings, Long> {

    List<Innings> findByMatchId(Long matchId);

    Optional<Innings> findByMatchIdAndInningsNumber(
        Long matchId,
        Integer inningsNumber
    );

    boolean existsByMatchIdAndInningsNumber(
        Long matchId,
        Integer inningsNumber
    );
}