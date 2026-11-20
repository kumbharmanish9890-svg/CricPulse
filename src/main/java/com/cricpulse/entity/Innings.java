package com.cricpulse.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "innings",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"match_id", "innings_number"}
        )
    }
)
public class Innings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    private Integer inningsNumber;

    private String battingTeam;

    private String bowlingTeam;

    private Integer totalRuns = 0;

    private Integer wickets = 0;

    private Integer legalBalls = 0;

    private Integer target;

 // Current batting and bowling positions
    private String currentStriker;

    private String currentNonStriker;

    private String currentBowler;

    private String inningsStatus = "NOT_STARTED";

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    public Innings() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

    public Integer getInningsNumber() {
        return inningsNumber;
    }

    public void setInningsNumber(Integer inningsNumber) {
        this.inningsNumber = inningsNumber;
    }

    public String getBattingTeam() {
        return battingTeam;
    }

    public void setBattingTeam(String battingTeam) {
        this.battingTeam = battingTeam;
    }

    public String getBowlingTeam() {
        return bowlingTeam;
    }

    public void setBowlingTeam(String bowlingTeam) {
        this.bowlingTeam = bowlingTeam;
    }

    public Integer getTotalRuns() {
        return totalRuns;
    }

    public void setTotalRuns(Integer totalRuns) {
        this.totalRuns = totalRuns;
    }

    public Integer getWickets() {
        return wickets;
    }

    public void setWickets(Integer wickets) {
        this.wickets = wickets;
    }

    public Integer getLegalBalls() {
        return legalBalls;
    }

    public void setLegalBalls(Integer legalBalls) {
        this.legalBalls = legalBalls;
    }

    public Integer getTarget() {
        return target;
    }

    public void setTarget(Integer target) {
        this.target = target;
    }

    public String getInningsStatus() {
        return inningsStatus;
    }

    public void setInningsStatus(String inningsStatus) {
        this.inningsStatus = inningsStatus;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    public String getCurrentStriker() {
        return currentStriker;
    }

    public void setCurrentStriker(String currentStriker) {
        this.currentStriker = currentStriker;
    }

    public String getCurrentNonStriker() {
        return currentNonStriker;
    }

    public void setCurrentNonStriker(String currentNonStriker) {
        this.currentNonStriker = currentNonStriker;
    }

    public String getCurrentBowler() {
        return currentBowler;
    }

    public void setCurrentBowler(String currentBowler) {
        this.currentBowler = currentBowler;
    }
}