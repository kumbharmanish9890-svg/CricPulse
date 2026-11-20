
package com.cricpulse.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.dto.PlayerStatisticsDTO;
import com.cricpulse.entity.BallDelivery;
import com.cricpulse.entity.Innings;
import com.cricpulse.repository.BallDeliveryRepository;
import com.cricpulse.repository.InningsRepository;

@Service
public class PlayerStatisticsService {

    private final BallDeliveryRepository ballDeliveryRepository;
    private final InningsRepository inningsRepository;

    public PlayerStatisticsService(
            BallDeliveryRepository ballDeliveryRepository,
            InningsRepository inningsRepository) {

        this.ballDeliveryRepository = ballDeliveryRepository;
        this.inningsRepository = inningsRepository;
    }

    @Transactional(readOnly = true)
    public PlayerStatisticsDTO getPlayerStatistics(String playerName) {

        if (playerName == null || playerName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Player name is required");
        }

        PlayerStatisticsDTO stats = new PlayerStatisticsDTO();
        stats.setPlayerName(playerName);

        Set<Long> matchesPlayed = new HashSet<>();

        List<Innings> inningsList = inningsRepository.findAll();

        for (Innings innings : inningsList) {

            if (innings.getMatch() == null
                    || !"COMPLETED".equalsIgnoreCase(
                            innings.getMatch().getMatchStatus())) {
                continue;
            }

            List<BallDelivery> deliveries =
                    ballDeliveryRepository.findByInningsId(
                            innings.getId());

            List<BallDelivery> battingDeliveries = deliveries.stream()
                    .filter(d -> playerName.equalsIgnoreCase(d.getBatsman()))
                    .collect(Collectors.toList());

            List<BallDelivery> bowlingDeliveries = deliveries.stream()
                    .filter(d -> playerName.equalsIgnoreCase(d.getBowler()))
                    .collect(Collectors.toList());

            boolean participated =
                    !battingDeliveries.isEmpty()
                    || !bowlingDeliveries.isEmpty();

            if (participated) {
                matchesPlayed.add(innings.getMatch().getId());
            }

            // BATTING STATISTICS
            if (!battingDeliveries.isEmpty()) {

                stats.setInningsPlayed(stats.getInningsPlayed() + 1);

                int inningsRuns = 0;

                for (BallDelivery ball : battingDeliveries) {

                    int runs = safe(ball.getRuns());

                    inningsRuns += runs;

                    stats.setRuns(stats.getRuns() + runs);

                    // Balls faced: Wide is not counted
                    if (!"WIDE".equalsIgnoreCase(ball.getExtraType())) {
                        stats.setBallsFaced(
                                stats.getBallsFaced() + 1);
                    }

                    // Fours and Sixes scored off the bat
                    if ("NONE".equalsIgnoreCase(ball.getExtraType())) {

                        if (runs == 4) {
                            stats.setFours(stats.getFours() + 1);
                        }

                        if (runs == 6) {
                            stats.setSixes(stats.getSixes() + 1);
                        }
                    }
                }

                stats.setHighestScore(
                        Math.max(stats.getHighestScore(), inningsRuns));

                boolean dismissed = deliveries.stream()
                        .anyMatch(d ->
                                d.isWicket()
                                && playerName.equalsIgnoreCase(
                                        d.getDismissedPlayer()));

                if (!dismissed) {
                    stats.setNotOuts(stats.getNotOuts() + 1);
                }
            }

            // BOWLING STATISTICS
            if (!bowlingDeliveries.isEmpty()) {

                Map<String, int[]> overData = new HashMap<>();

                for (BallDelivery ball : bowlingDeliveries) {

                    String extraType = ball.getExtraType() == null
                            ? "NONE"
                            : ball.getExtraType().toUpperCase();

                    int totalRuns = safe(ball.getTotalRuns());

                    // Runs conceded by bowler
                    if (!"BYE".equals(extraType)
                            && !"LEG_BYE".equals(extraType)) {

                        stats.setRunsConceded(
                                stats.getRunsConceded() + totalRuns);
                    }

                    // Legal balls bowled
                    if (ball.isLegalDelivery()) {
                        stats.setBallsBowled(
                                stats.getBallsBowled() + 1);
                    }

                    // Wickets credited to bowler
                    if (ball.isWicket()
                            && isBowlerCreditedWicket(ball.getWicketType())) {

                        stats.setWickets(stats.getWickets() + 1);
                    }

                    // Track runs and legal balls for maiden overs
                    String overKey = ball.getBowler()
                            + "_" + ball.getOverNumber();

                    int[] data = overData.computeIfAbsent(
                            overKey, key -> new int[2]);

                    if (!"BYE".equals(extraType)
                            && !"LEG_BYE".equals(extraType)) {
                        data[0] += totalRuns;
                    }

                    if (ball.isLegalDelivery()) {
                        data[1]++;
                    }
                }

                // Maiden overs: 6 legal balls and zero runs conceded
                for (int[] data : overData.values()) {

                    if (data[1] == 6 && data[0] == 0) {
                        stats.setMaidens(stats.getMaidens() + 1);
                    }
                }
            }
        }

        stats.setMatchesPlayed(matchesPlayed.size());

        // Batting average
        int dismissals =
                stats.getInningsPlayed() - stats.getNotOuts();

        if (dismissals > 0) {
            stats.setBattingAverage(
                    round(stats.getRuns() / (double) dismissals));
        }

        // Strike rate
        if (stats.getBallsFaced() > 0) {
            stats.setStrikeRate(
                    round(stats.getRuns() * 100.0
                            / stats.getBallsFaced()));
        }

        // Bowling economy
        if (stats.getBallsBowled() > 0) {
            stats.setEconomy(
                    round(stats.getRunsConceded() * 6.0
                            / stats.getBallsBowled()));
        }

        // Bowling average
        if (stats.getWickets() > 0) {
            stats.setBowlingAverage(
                    round(stats.getRunsConceded()
                            / (double) stats.getWickets()));
        }

        return stats;
    }

    private boolean isBowlerCreditedWicket(String wicketType) {

        if (wicketType == null) {
            return false;
        }

        return List.of(
                "BOWLED",
                "CAUGHT",
                "LBW",
                "STUMPED",
                "HIT_WICKET",
                "CAUGHT_AND_BOWLED"
        ).contains(wicketType.toUpperCase());
    }

    private int safe(Integer value) {
        return value == null ? 0 : value;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
