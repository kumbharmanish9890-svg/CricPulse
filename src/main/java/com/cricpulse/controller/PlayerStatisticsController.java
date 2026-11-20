
package com.cricpulse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cricpulse.dto.PlayerStatisticsDTO;
import com.cricpulse.service.PlayerStatisticsService;

@RestController
@RequestMapping("/api/player-statistics")
@CrossOrigin(origins = "http://localhost:5173")
public class PlayerStatisticsController {

    private final PlayerStatisticsService playerStatisticsService;

    public PlayerStatisticsController(
            PlayerStatisticsService playerStatisticsService) {

        this.playerStatisticsService = playerStatisticsService;
    }

    // GET PLAYER CAREER STATISTICS
    @GetMapping("/{playerName}")
    public ResponseEntity<PlayerStatisticsDTO> getPlayerStatistics(
            @PathVariable String playerName) {

        PlayerStatisticsDTO statistics =
                playerStatisticsService.getPlayerStatistics(playerName);

        return ResponseEntity.ok(statistics);
    }
}
