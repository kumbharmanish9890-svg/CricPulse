
package com.cricpulse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.entity.Match;
import com.cricpulse.entity.Toss;
import com.cricpulse.repository.MatchRepository;
import com.cricpulse.repository.TossRepository;

@RestController
@RequestMapping("/api/toss")
@CrossOrigin(origins = "http://localhost:5173")
public class TossController {

    private final TossRepository tossRepository;
    private final MatchRepository matchRepository;

    public TossController(
            TossRepository tossRepository,
            MatchRepository matchRepository) {

        this.tossRepository = tossRepository;
        this.matchRepository = matchRepository;
    }

    // CONDUCT TOSS
    @PostMapping("/{matchId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Toss> conductToss(
            @PathVariable Long matchId,
            @RequestBody Toss toss) {

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Match not found"));

        if (tossRepository.existsByMatchId(matchId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Toss already conducted for this match");
        }

        String winner = toss.getTossWinner();
        String decision = toss.getTossDecision();

        if (winner == null ||
                (!winner.equals(match.getTeam1())
                && !winner.equals(match.getTeam2()))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Toss winner must be one of the match teams");
        }

        if (decision == null ||
                (!decision.equals("BAT")
                && !decision.equals("BOWL"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Decision must be BAT or BOWL");
        }

        toss.setId(null);
        toss.setMatch(match);

        Toss savedToss = tossRepository.save(toss);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedToss);
    }

    // GET TOSS DETAILS
    @GetMapping("/{matchId}")
    public ResponseEntity<Toss> getToss(
            @PathVariable Long matchId) {

        Toss toss = tossRepository.findByMatchId(matchId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Toss not conducted yet"));

        return ResponseEntity.ok(toss);
    }
}
