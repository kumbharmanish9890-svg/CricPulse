
package com.cricpulse.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.entity.PointsTable;
import com.cricpulse.entity.Team;
import com.cricpulse.entity.Tournament;
import com.cricpulse.repository.PointsTableRepository;
import com.cricpulse.repository.TeamRepository;
import com.cricpulse.repository.TournamentRepository;

@RestController
@RequestMapping("/api/points-table")
@CrossOrigin(origins = "http://localhost:5173")
public class PointsTableController {

    private final PointsTableRepository pointsTableRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;

    public PointsTableController(
            PointsTableRepository pointsTableRepository,
            TournamentRepository tournamentRepository,
            TeamRepository teamRepository) {

        this.pointsTableRepository = pointsTableRepository;
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
    }

    // GET POINTS TABLE BY TOURNAMENT
    @GetMapping("/tournament/{tournamentId}")
    public List<PointsTable> getPointsTable(
            @PathVariable Long tournamentId) {

        if (!tournamentRepository.existsById(tournamentId)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Tournament not found"
            );
        }

        return pointsTableRepository
                .findByTournamentId(tournamentId);
    }

    // ADD TEAM TO POINTS TABLE
    @PostMapping("/tournament/{tournamentId}/team/{teamId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PointsTable addTeamToPointsTable(
            @PathVariable Long tournamentId,
            @PathVariable Long teamId) {

        Tournament tournament = tournamentRepository
                .findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Tournament not found"
                ));

        Team team = teamRepository
                .findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Team not found"
                ));

        if (team.getTournament() == null ||
                !team.getTournament().getId().equals(tournamentId)) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Team does not belong to this tournament"
            );
        }

        if (pointsTableRepository.existsByTournamentIdAndTeamId(
                tournamentId, teamId)) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Team already exists in points table"
            );
        }

        PointsTable entry = new PointsTable();

        entry.setTournament(tournament);
        entry.setTeam(team);

        return pointsTableRepository.save(entry);
    }
}
