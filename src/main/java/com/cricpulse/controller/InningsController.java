
package com.cricpulse.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.entity.Innings;
import com.cricpulse.entity.Match;
import com.cricpulse.repository.InningsRepository;
import com.cricpulse.repository.MatchRepository;
import com.cricpulse.repository.PlayerRepository;

@RestController
@RequestMapping("/api/innings")
@CrossOrigin(origins = "http://localhost:5173")
public class InningsController {

    private final InningsRepository inningsRepository;
    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;

    public InningsController(
            InningsRepository inningsRepository,
            MatchRepository matchRepository,
            PlayerRepository playerRepository) {

        this.inningsRepository = inningsRepository;
        this.matchRepository = matchRepository;
        this.playerRepository = playerRepository;
    }

    // GET ALL INNINGS OF A MATCH
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<Innings>> getInningsByMatch(
            @PathVariable Long matchId) {

        if (!matchRepository.existsById(matchId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Match not found");
        }

        return ResponseEntity.ok(
                inningsRepository.findByMatchId(matchId));
    }

    // GET INNINGS BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Innings> getInningsById(
            @PathVariable Long id) {

        Innings innings = inningsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Innings not found"));

        return ResponseEntity.ok(innings);
    }

    // CREATE INNINGS
    @PostMapping("/match/{matchId}")
    @PreAuthorize("hasAnyRole('ADMIN','SCORER')")
    public ResponseEntity<Innings> createInnings(
            @PathVariable Long matchId,
            @RequestBody Innings request) {

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Match not found"));

        if (request.getInningsNumber() == null
                || request.getInningsNumber() < 1
                || request.getInningsNumber() > 2) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Innings number must be 1 or 2");
        }

        if (request.getBattingTeam() == null
                || request.getBowlingTeam() == null
                || request.getBattingTeam().isBlank()
                || request.getBowlingTeam().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Batting team and bowling team are required");
        }

        boolean teamsMatch =
                (request.getBattingTeam().equals(match.getTeam1())
                && request.getBowlingTeam().equals(match.getTeam2()))
                ||
                (request.getBattingTeam().equals(match.getTeam2())
                && request.getBowlingTeam().equals(match.getTeam1()));

        if (!teamsMatch) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Batting and bowling teams must belong to this match");
        }

        if (inningsRepository.existsByMatchIdAndInningsNumber(
                matchId, request.getInningsNumber())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This innings already exists for the match");
        }

        Innings innings = new Innings();

        innings.setMatch(match);
        innings.setInningsNumber(request.getInningsNumber());
        innings.setBattingTeam(request.getBattingTeam());
        innings.setBowlingTeam(request.getBowlingTeam());

        innings.setTotalRuns(0);
        innings.setWickets(0);
        innings.setLegalBalls(0);

        innings.setInningsStatus("IN_PROGRESS");
        innings.setStartTime(LocalDateTime.now());

        // Automatically set second innings target
        if (request.getInningsNumber() == 2) {

            inningsRepository.findByMatchIdAndInningsNumber(
                    matchId, 1
            ).ifPresent(firstInnings -> {

                if ("COMPLETED".equals(
                        firstInnings.getInningsStatus())) {

                    int firstInningsRuns =
                            firstInnings.getTotalRuns() == null
                            ? 0 : firstInnings.getTotalRuns();

                    innings.setTarget(firstInningsRuns + 1);
                }
            });
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inningsRepository.save(innings));
    }

    // SELECT STRIKER, NON-STRIKER AND BOWLER
    @PutMapping("/{id}/players")
    @PreAuthorize("hasAnyRole('ADMIN','SCORER')")
    public ResponseEntity<Innings> selectPlayers(
            @PathVariable Long id,
            @RequestBody Innings request) {

        Innings innings = inningsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Innings not found"));

        if (!"IN_PROGRESS".equals(innings.getInningsStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Innings is not in progress");
        }

        String striker = request.getCurrentStriker();
        String nonStriker = request.getCurrentNonStriker();
        String bowler = request.getCurrentBowler();

        if (striker == null || striker.isBlank()
                || nonStriker == null || nonStriker.isBlank()
                || bowler == null || bowler.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Striker, non-striker and bowler are required");
        }

        if (striker.equals(nonStriker)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Striker and non-striker must be different");
        }

        // Validate striker belongs to batting team
        if (playerRepository.findByPlayerNameAndTeam_TeamName(
                striker, innings.getBattingTeam()).isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Striker does not belong to batting team");
        }

        // Validate non-striker belongs to batting team
        if (playerRepository.findByPlayerNameAndTeam_TeamName(
                nonStriker, innings.getBattingTeam()).isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Non-striker does not belong to batting team");
        }

        // Validate bowler belongs to bowling team
        if (playerRepository.findByPlayerNameAndTeam_TeamName(
                bowler, innings.getBowlingTeam()).isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bowler does not belong to bowling team");
        }

        innings.setCurrentStriker(striker);
        innings.setCurrentNonStriker(nonStriker);
        innings.setCurrentBowler(bowler);

        return ResponseEntity.ok(inningsRepository.save(innings));
    }
}
