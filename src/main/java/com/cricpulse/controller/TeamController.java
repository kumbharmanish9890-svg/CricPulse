
package com.cricpulse.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.entity.Team;
import com.cricpulse.entity.Tournament;
import com.cricpulse.repository.TeamRepository;
import com.cricpulse.repository.TournamentRepository;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;

    public TeamController(
            TeamRepository teamRepository,
            TournamentRepository tournamentRepository) {

        this.teamRepository = teamRepository;
        this.tournamentRepository = tournamentRepository;
    }

    // Get All Teams
    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    // Get Teams By Tournament ID
    @GetMapping("/tournament/{tournamentId}")
    public List<Team> getTeamsByTournament(
            @PathVariable Long tournamentId) {

        return teamRepository.findByTournamentId(tournamentId);
    }

    // Get Team By ID
    @GetMapping("/{id}")
    public Team getTeamById(@PathVariable Long id) {

        return teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Team Not Found"));
    }

    // Add Team To Tournament
    @PostMapping("/tournament/{tournamentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Team addTeam(
            @PathVariable Long tournamentId,
            @RequestBody Team team) {

        Tournament tournament = tournamentRepository
                .findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tournament Not Found"));

        team.setTournament(tournament);

        return teamRepository.save(team);
    }

    // Update Team
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Team updateTeam(
            @PathVariable Long id,
            @RequestBody Team updatedTeam) {

        Team existingTeam = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Team Not Found"));

        existingTeam.setTeamName(updatedTeam.getTeamName());
        existingTeam.setShortName(updatedTeam.getShortName());
        existingTeam.setCountry(updatedTeam.getCountry());
        existingTeam.setCoachName(updatedTeam.getCoachName());

        return teamRepository.save(existingTeam);
    }

    // Delete Team
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteTeam(@PathVariable Long id) {

        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Team Not Found"));

        teamRepository.delete(team);

        return "Team Deleted Successfully";
    }
}
