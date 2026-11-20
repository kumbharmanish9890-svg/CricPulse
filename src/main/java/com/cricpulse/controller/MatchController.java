
package com.cricpulse.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.entity.Match;
import com.cricpulse.entity.Tournament;
import com.cricpulse.repository.MatchRepository;
import com.cricpulse.repository.TournamentRepository;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchController {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;

    public MatchController(
            MatchRepository matchRepository,
            TournamentRepository tournamentRepository) {

        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
    }

    // 1. Get All Matches
    @GetMapping
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    // 2. Get Match By ID
    @GetMapping("/{id}")
    public Match getMatchById(@PathVariable Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Match Not Found"));
    }

    // 3. Add New Match
    @PostMapping
    public Match addMatch(@RequestBody Match match) {

        match.setMatchStatus(
            match.getMatchStatus() == null
                ? "UPCOMING"
                : match.getMatchStatus()
        );

        // Assign Tournament
        if (match.getTournament() != null
                && match.getTournament().getId() != null) {

            Tournament tournament = tournamentRepository
                    .findById(match.getTournament().getId())
                    .orElseThrow(() ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Tournament Not Found"));

            match.setTournament(tournament);
        }

        return matchRepository.save(match);
    }

    // 4. Update Match
    @PutMapping("/{id}")
    public Match updateMatch(
            @PathVariable Long id,
            @RequestBody Match updatedMatch) {

        Match existingMatch = matchRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Match Not Found"));

        existingMatch.setTeam1(updatedMatch.getTeam1());
        existingMatch.setTeam2(updatedMatch.getTeam2());
        existingMatch.setVenue(updatedMatch.getVenue());
        existingMatch.setMatchStatus(updatedMatch.getMatchStatus());
        existingMatch.setMatchFormat(updatedMatch.getMatchFormat());
        existingMatch.setMatchDate(updatedMatch.getMatchDate());

        // Update Tournament
        if (updatedMatch.getTournament() != null
                && updatedMatch.getTournament().getId() != null) {

            Tournament tournament = tournamentRepository
                    .findById(updatedMatch.getTournament().getId())
                    .orElseThrow(() ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Tournament Not Found"));

            existingMatch.setTournament(tournament);
        }

        return matchRepository.save(existingMatch);
    }

    // 5. Delete Match
    @DeleteMapping("/{id}")
    public String deleteMatch(@PathVariable Long id) {

        Match match = matchRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Match Not Found"));

        matchRepository.delete(match);

        return "Match Deleted Successfully";
    }

    // 6. Get Completed Match History
    @GetMapping("/history")
    public List<Match> getMatchHistory() {

        return matchRepository.findAll()
                .stream()
                .filter(match ->
                    "COMPLETED".equalsIgnoreCase(match.getMatchStatus())
                )
                .toList();
    }
}
