
package com.cricpulse.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String team1;

    private String team2;

    private String venue;

    private String matchStatus;

    private String matchFormat;

    private LocalDateTime matchDate;

    private String winner;
    private String resultSummary;

    public boolean isPointsTableUpdated() {
		return pointsTableUpdated;
	}

	public void setPointsTableUpdated(boolean pointsTableUpdated) {
		this.pointsTableUpdated = pointsTableUpdated;
	}

	private boolean pointsTableUpdated = false;

    public String getWinner() {
		return winner;
	}

	public void setWinner(String winner) {
		this.winner = winner;
	}

	public String getResultSummary() {
		return resultSummary;
	}

	public void setResultSummary(String resultSummary) {
		this.resultSummary = resultSummary;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@ManyToOne
	@JoinColumn(name = "tournament_id")
	private Tournament tournament;


  //  private String matchStatus;

    public Match() {
    }

    public Match(String team1, String team2,
                 String venue, String matchStatus,
                 String matchFormat,
                 LocalDateTime matchDate) {

        this.team1 = team1;
        this.team2 = team2;
        this.venue = venue;
        this.matchStatus = matchStatus;
        this.matchFormat = matchFormat;
        this.matchDate = matchDate;
    }

    public Long getId() {
        return id;
    }

    public String getTeam1() {
        return team1;
    }

    public void setTeam1(String team1) {
        this.team1 = team1;
    }

    public String getTeam2() {
        return team2;
    }

    public void setTeam2(String team2) {
        this.team2 = team2;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getMatchStatus() {
        return matchStatus;
    }

    public void setMatchStatus(String matchStatus) {
        this.matchStatus = matchStatus;
    }

    public String getMatchFormat() {
        return matchFormat;
    }

    public void setMatchFormat(String matchFormat) {
        this.matchFormat = matchFormat;
    }

    public LocalDateTime getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(LocalDateTime matchDate) {
        this.matchDate = matchDate;
    }
    public Tournament getTournament() {
        return tournament;
    }

    public void setTournament(Tournament tournament) {
        this.tournament = tournament;
    }
}
