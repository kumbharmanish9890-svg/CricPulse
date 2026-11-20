
package com.cricpulse.controller;

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

import com.cricpulse.entity.Match;
import com.cricpulse.entity.MatchSquad;
import com.cricpulse.entity.Player;
import com.cricpulse.repository.MatchRepository;
import com.cricpulse.repository.MatchSquadRepository;
import com.cricpulse.repository.PlayerRepository;

@RestController
@RequestMapping("/api/match-squads")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchSquadController {

    private final MatchSquadRepository matchSquadRepository;
    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;

    // CONSTRUCTOR
    public MatchSquadController(
            MatchSquadRepository matchSquadRepository,
            MatchRepository matchRepository,
            PlayerRepository playerRepository) {

        this.matchSquadRepository = matchSquadRepository;
        this.matchRepository = matchRepository;
        this.playerRepository = playerRepository;
    }

    // ADD PLAYER TO MATCH SQUAD
    @PostMapping("/{matchId}/player/{playerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchSquad> addPlayerToSquad(
            @PathVariable Long matchId,
            @PathVariable Long playerId,
            @RequestBody MatchSquad squad) {

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Match not found"));

        Player player = playerRepository.findById(playerId)

                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Player not found"));

        if (matchSquadRepository.existsByMatchIdAndPlayerId(matchId, playerId)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Player is already added to this match"
            );
        }

        if (squad.isPlaying()) {

            Long teamId = player.getTeam().getId();

            long playingCount =
                    matchSquadRepository
                        .countByMatch_IdAndPlayer_Team_IdAndPlayingTrue(
                            matchId, teamId);

           // DEBUG CODE
            System.out.println("DEBUG Match ID: " + matchId);
            System.out.println("DEBUG Player ID: " + playerId);
            System.out.println("DEBUG Team ID: " + teamId);
            System.out.println("DEBUG Playing Count: " + playingCount);


            if (playingCount >= 11) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A team can have maximum 11 Playing XI players"
                );
            }
        }

        squad.setId(null);
        squad.setMatch(match);
        squad.setPlayer(player);




        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matchSquadRepository.save(squad));
    }

    // GET ALL PLAYERS IN A MATCH
    @GetMapping("/{matchId}")
    public List<MatchSquad> getMatchSquad(
            @PathVariable Long matchId) {


        return matchSquadRepository.findByMatchId(matchId);
    }


    // GET PLAYING XI

    @GetMapping("/{matchId}/playing-xi")
    public List<MatchSquad> getPlayingXI(
            @PathVariable Long matchId) {

        return matchSquadRepository
                .findByMatchIdAndPlayingTrue(matchId);
    }

 // GET BENCH PLAYERS

    @GetMapping("/{matchId}/bench")
    public List<MatchSquad> getBenchPlayers(
            @PathVariable Long matchId) {

        return matchSquadRepository
                .findByMatchIdAndPlayingFalse(matchId);
    }


    // UPDATE CAPTAIN AND WICKET KEEPER

    @PutMapping("/{squadId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchSquad> updateSquadRoles(
            @PathVariable Long squadId,
            @RequestBody MatchSquad updatedSquad) {

        MatchSquad squad = matchSquadRepository.findById(squadId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Squad entry not found"));

        if (!squad.isPlaying()
                && (updatedSquad.isCaptain()
                || updatedSquad.isWicketKeeper())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Captain and Wicket Keeper must be in Playing XI");
        }

        squad.setCaptain(updatedSquad.isCaptain());
        squad.setWicketKeeper(updatedSquad.isWicketKeeper());

        return ResponseEntity.ok(
                matchSquadRepository.save(squad));


    }
    @PutMapping("/{squadId}/playing-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchSquad> updatePlayingStatus(
            @PathVariable Long squadId,
            @RequestBody MatchSquad updatedSquad) {

        MatchSquad squad = matchSquadRepository.findById(squadId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Squad entry not found"));

        if (updatedSquad.isPlaying()) {

            Long matchId = squad.getMatch().getId();
            Long teamId = squad.getPlayer().getTeam().getId();

            long playingCount = matchSquadRepository
                    .countByMatch_IdAndPlayer_Team_IdAndPlayingTrue(
                            matchId, teamId);

            if (playingCount >= 11) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A team can have maximum 11 Playing XI players");
            }
        }

        squad.setPlaying(updatedSquad.isPlaying());

        return ResponseEntity.ok(matchSquadRepository.save(squad));
    }


}
