
package com.cricpulse.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cricpulse.entity.Player;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByTeamId(Long teamId);

    Optional<Player> findByPlayerNameAndTeam_TeamName(
            String playerName,
            String teamName
    );

    // Search players by name
    List<Player> findByPlayerNameContainingIgnoreCase(String playerName);

    // Search players by contact number
    List<Player> findByContactNumberContaining(String contactNumber);

    // Search players by email
    List<Player> findByEmailContainingIgnoreCase(String email);
}
