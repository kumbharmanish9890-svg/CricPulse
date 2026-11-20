
package com.cricpulse.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.entity.BallDelivery;
import com.cricpulse.entity.Innings;
import com.cricpulse.entity.Match;
import com.cricpulse.entity.PointsTable;
import com.cricpulse.repository.BallDeliveryRepository;
import com.cricpulse.repository.InningsRepository;
import com.cricpulse.repository.MatchRepository;
import com.cricpulse.repository.PointsTableRepository;

@RestController
@RequestMapping("/api/ball-deliveries")
@CrossOrigin(origins = "http://localhost:5173")
public class BallDeliveryController {

    private final BallDeliveryRepository ballDeliveryRepository;
    private final InningsRepository inningsRepository;
    private final MatchRepository matchRepository;
    private final PointsTableRepository pointsTableRepository;

    public BallDeliveryController(
            BallDeliveryRepository ballDeliveryRepository,
            InningsRepository inningsRepository,
            MatchRepository matchRepository,
            PointsTableRepository pointsTableRepository) {

        this.ballDeliveryRepository = ballDeliveryRepository;
        this.inningsRepository = inningsRepository;
        this.matchRepository = matchRepository;
        this.pointsTableRepository = pointsTableRepository;
    }

    // GET ALL BALLS OF AN INNINGS
    @GetMapping("/innings/{inningsId}")
    public List<BallDelivery> getBalls(@PathVariable Long inningsId) {

        if (!inningsRepository.existsById(inningsId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Innings not found");
        }

        return ballDeliveryRepository
                .findByInningsIdOrderByOverNumberAscBallNumberAsc(inningsId);
    }

    // ADD BALL DELIVERY
    @PostMapping("/innings/{inningsId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCORER')")
    @Transactional
    public BallDelivery addBall(
            @PathVariable Long inningsId,
            @RequestBody BallDelivery delivery) {

        Innings innings = inningsRepository.findById(inningsId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Innings not found"));

        if (!"IN_PROGRESS".equals(innings.getInningsStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Innings is not in progress");
        }

        int wickets = safe(innings.getWickets());

        if (wickets >= 10) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "All wickets have fallen");
        }

        // Check selected players
        if (innings.getCurrentStriker() == null
                || innings.getCurrentNonStriker() == null
                || innings.getCurrentBowler() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select and save both batsmen and bowler first");
        }

        if (!innings.getCurrentStriker().equals(delivery.getBatsman())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected batsman does not match current striker");
        }

        if (!innings.getCurrentBowler().equals(delivery.getBowler())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected bowler does not match current bowler");
        }

        int runs = safe(delivery.getRuns());
        int extraRuns = safe(delivery.getExtraRuns());

        if (runs < 0 || runs > 6 || extraRuns < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid runs");
        }

        String extraType = delivery.getExtraType() == null
                ? "NONE"
                : delivery.getExtraType().toUpperCase();

        if (!List.of("NONE", "WIDE", "NO_BALL", "BYE", "LEG_BYE")
                .contains(extraType)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid extra type");
        }

        boolean legalDelivery =
                !extraType.equals("WIDE")
                && !extraType.equals("NO_BALL");

        int totalRuns = runs + extraRuns;

        int legalBalls = safe(innings.getLegalBalls());

        // Prepare delivery
        delivery.setId(null);
        delivery.setInnings(innings);
        delivery.setRuns(runs);
        delivery.setExtraRuns(extraRuns);
        delivery.setTotalRuns(totalRuns);
        delivery.setExtraType(extraType);
        delivery.setLegalDelivery(legalDelivery);
        delivery.setOverNumber((legalBalls / 6) + 1);
        delivery.setBallNumber((legalBalls % 6) + 1);

        // Validate wicket
        if (delivery.isWicket()) {

            if (delivery.getDismissedPlayer() == null
                    || delivery.getDismissedPlayer().isBlank()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Dismissed player is required");
            }

            if (!delivery.getDismissedPlayer().equals(
                    innings.getCurrentStriker())
                    && !delivery.getDismissedPlayer().equals(
                    innings.getCurrentNonStriker())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Dismissed player must be one of the current batsmen");
            }
        }

        // Save ball delivery
        BallDelivery savedDelivery =
                ballDeliveryRepository.save(delivery);

        // Update total score
        int currentTotal = safe(innings.getTotalRuns()) + totalRuns;
        innings.setTotalRuns(currentTotal);

        // Update wickets
        if (delivery.isWicket()) {
            wickets++;
            innings.setWickets(wickets);
        }

        // Update legal balls
        if (legalDelivery) {
            legalBalls++;
            innings.setLegalBalls(legalBalls);
        }

        // Calculate completed runs
        int completedRuns = 0;

        switch (extraType) {

            case "NONE":
            case "NO_BALL":
                completedRuns = runs;
                break;

            case "BYE":
            case "LEG_BYE":
                completedRuns = extraRuns;
                break;

            case "WIDE":
                completedRuns = Math.max(0, extraRuns - 1);
                break;

            default:
                completedRuns = 0;
        }

        // Handle wicket and strike rotation
        if (delivery.isWicket()) {

            String dismissed = delivery.getDismissedPlayer();

            if (dismissed.equals(innings.getCurrentStriker())) {
                innings.setCurrentStriker(null);

            } else if (dismissed.equals(
                    innings.getCurrentNonStriker())) {

                innings.setCurrentNonStriker(null);
            }

        } else {

            if (completedRuns % 2 != 0) {
                swapStrike(innings);
            }

            if (legalDelivery && legalBalls % 6 == 0) {
                swapStrike(innings);
            }
        }

        // Check maximum overs
        int maxOvers = getMaxOvers(
                innings.getMatch().getMatchFormat());

        boolean oversCompleted =
                maxOvers > 0 && legalBalls >= maxOvers * 6;

        // Check target
        Integer target = innings.getTarget();

        boolean targetReached =
                innings.getInningsNumber() != null
                && innings.getInningsNumber() == 2
                && target != null
                && currentTotal >= target;

        // Complete innings
        if (wickets >= 10 || oversCompleted || targetReached) {

            innings.setInningsStatus("COMPLETED");
            innings.setEndTime(LocalDateTime.now());

            // First innings completed: set second innings target
            if (innings.getInningsNumber() != null
                    && innings.getInningsNumber() == 1) {

                inningsRepository.findByMatchIdAndInningsNumber(
                        innings.getMatch().getId(), 2
                ).ifPresent(secondInnings -> {

                    secondInnings.setTarget(currentTotal + 1);
                    inningsRepository.save(secondInnings);
                });
            }
        }

        // Save updated innings
        inningsRepository.save(innings);

        // Calculate result after second innings
        if (innings.getInningsNumber() != null
                && innings.getInningsNumber() == 2
                && "COMPLETED".equals(innings.getInningsStatus())) {

            calculateMatchResult(innings, currentTotal, wickets);
        }

        return savedDelivery;
    }

    // CALCULATE AND SAVE MATCH RESULT
    private void calculateMatchResult(
            Innings innings,
            int secondInningsRuns,
            int wickets) {

        Match match = innings.getMatch();

        Integer target = innings.getTarget();

        // Get target from first innings if missing
        if (target == null) {

            Innings firstInnings = inningsRepository
                    .findByMatchIdAndInningsNumber(
                            match.getId(), 1)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "First innings not found"));

            target = safe(firstInnings.getTotalRuns()) + 1;
            innings.setTarget(target);
        }

        String winner;
        String result;

        // Batting team reached target
        if (secondInningsRuns >= target) {

            winner = innings.getBattingTeam();

            int wicketsRemaining = 10 - wickets;

            result = winner + " won by "
                    + wicketsRemaining + " wickets";

        }
        // Both teams scored equal runs
        else if (secondInningsRuns == target - 1) {

            winner = "TIE";
            result = "Match tied";

        }
        // Bowling team won
        else {

            winner = innings.getBowlingTeam();

            int runsDifference = (target - 1) - secondInningsRuns;

            result = winner + " won by "
                    + runsDifference + " runs";
        }

        // Save match result
        match.setWinner(winner);
        match.setResultSummary(result);
        match.setMatchStatus("COMPLETED");

        matchRepository.save(match);
        inningsRepository.save(innings);

        // Fetch both innings
        Innings firstInnings = inningsRepository
                .findByMatchIdAndInningsNumber(match.getId(), 1)
                .orElse(null);

        Innings secondInnings = inningsRepository
                .findByMatchIdAndInningsNumber(match.getId(), 2)
                .orElse(null);

        // Update Points Table
        if (firstInnings != null
                && secondInnings != null
                && match.getTournament() != null) {

            updatePointsTable(match, firstInnings, secondInnings);
        }
    }

    // AUTOMATIC POINTS TABLE UPDATE
    private void updatePointsTable(
            Match match,
            Innings firstInnings,
            Innings secondInnings) {

        if (match.getTournament() == null) {
            return;
        }

        Long tournamentId = match.getTournament().getId();

        String team1 = firstInnings.getBattingTeam();
        String team2 = secondInnings.getBattingTeam();

        List<PointsTable> table =
                pointsTableRepository.findByTournamentId(tournamentId);

        PointsTable points1 = table.stream()
                .filter(p -> p.getTeam().getTeamName().equals(team1))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Points Table entry not found for " + team1));

        PointsTable points2 = table.stream()
                .filter(p -> p.getTeam().getTeamName().equals(team2))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Points Table entry not found for " + team2));

        // Matches Played
        points1.setMatchesPlayed(safe(points1.getMatchesPlayed()) + 1);
        points2.setMatchesPlayed(safe(points2.getMatchesPlayed()) + 1);

        // Runs Scored and Conceded
        points1.setRunsScored(
                safe(points1.getRunsScored()) + safe(firstInnings.getTotalRuns()));

        points1.setRunsConceded(
                safe(points1.getRunsConceded()) + safe(secondInnings.getTotalRuns()));

        points2.setRunsScored(
                safe(points2.getRunsScored()) + safe(secondInnings.getTotalRuns()));

        points2.setRunsConceded(
                safe(points2.getRunsConceded()) + safe(firstInnings.getTotalRuns()));

        // Balls Faced and Bowled
        points1.setBallsFaced(
                safe(points1.getBallsFaced()) + safe(firstInnings.getLegalBalls()));

        points1.setBallsBowled(
                safe(points1.getBallsBowled()) + safe(secondInnings.getLegalBalls()));

        points2.setBallsFaced(
                safe(points2.getBallsFaced()) + safe(secondInnings.getLegalBalls()));

        points2.setBallsBowled(
                safe(points2.getBallsBowled()) + safe(firstInnings.getLegalBalls()));

        // Points Calculation
        if ("TIE".equalsIgnoreCase(match.getWinner())) {

            points1.setTies(safe(points1.getTies()) + 1);
            points2.setTies(safe(points2.getTies()) + 1);

            points1.setPoints(safe(points1.getPoints()) + 1);
            points2.setPoints(safe(points2.getPoints()) + 1);

        } else if (team1.equals(match.getWinner())) {

            points1.setWins(safe(points1.getWins()) + 1);
            points2.setLosses(safe(points2.getLosses()) + 1);

            points1.setPoints(safe(points1.getPoints()) + 2);

        } else if (team2.equals(match.getWinner())) {

            points2.setWins(safe(points2.getWins()) + 1);
            points1.setLosses(safe(points1.getLosses()) + 1);

            points2.setPoints(safe(points2.getPoints()) + 2);
        }

        // Net Run Rate
        points1.setNetRunRate(calculateNRR(
                points1.getRunsScored(),
                points1.getBallsFaced(),
                points1.getRunsConceded(),
                points1.getBallsBowled()));

        points2.setNetRunRate(calculateNRR(
                points2.getRunsScored(),
                points2.getBallsFaced(),
                points2.getRunsConceded(),
                points2.getBallsBowled()));

        pointsTableRepository.save(points1);
        pointsTableRepository.save(points2);
    }

    // NULL VALUE HANDLING
    private int safe(Integer value) {
        return value == null ? 0 : value;
    }

    // NET RUN RATE CALCULATION
    private double calculateNRR(
            Integer runsScored,
            Integer ballsFaced,
            Integer runsConceded,
            Integer ballsBowled) {

        int scored = safe(runsScored);
        int faced = safe(ballsFaced);
        int conceded = safe(runsConceded);
        int bowled = safe(ballsBowled);

        if (faced == 0 || bowled == 0) {
            return 0.0;
        }

        double runRateFor = scored * 6.0 / faced;
        double runRateAgainst = conceded * 6.0 / bowled;

        return Math.round(
                (runRateFor - runRateAgainst) * 1000.0) / 1000.0;
    }

    // GET MAX OVERS BASED ON MATCH FORMAT
    private int getMaxOvers(String matchFormat) {

        if (matchFormat == null) {
            return 0;
        }

        String format = matchFormat.toUpperCase();

        if (format.contains("T10")) {
            return 10;
        }

        if (format.contains("T20")) {
            return 20;
        }

        if (format.contains("ODI")
                || format.contains("50")) {
            return 50;
        }

        return 0;
    }

    // SWAP STRIKER AND NON-STRIKER
    private void swapStrike(Innings innings) {

        String temp = innings.getCurrentStriker();

        innings.setCurrentStriker(
                innings.getCurrentNonStriker());

        innings.setCurrentNonStriker(temp);
    }
}
