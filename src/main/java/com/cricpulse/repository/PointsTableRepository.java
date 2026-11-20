
package com.cricpulse.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cricpulse.entity.PointsTable;

@Repository
public interface PointsTableRepository
        extends JpaRepository<PointsTable, Long> {

    List<PointsTable> findByTournamentId(Long tournamentId);

    Optional<PointsTable> findByTournamentIdAndTeamId(
        Long tournamentId,
        Long teamId
    );

    boolean existsByTournamentIdAndTeamId(
        Long tournamentId,
        Long teamId
    );
}
