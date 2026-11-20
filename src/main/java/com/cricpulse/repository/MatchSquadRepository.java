
package com.cricpulse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cricpulse.entity.MatchSquad;

@Repository
public interface MatchSquadRepository extends JpaRepository<MatchSquad, Long> {

    List<MatchSquad> findByMatchIdAndPlayingFalse(Long matchId);

    List<MatchSquad> findByMatchId(Long matchId);

    List<MatchSquad> findByMatchIdAndPlayingTrue(Long matchId);

    List<MatchSquad> findByMatchIdAndPlayerTeamId(Long matchId, Long teamId);

    boolean existsByMatchIdAndPlayerId(Long matchId, Long playerId);

    boolean existsByPlayerId(Long playerId);

    long countByMatch_IdAndPlayer_Team_IdAndPlayingTrue(
            Long matchId,
            Long teamId
    );
}
