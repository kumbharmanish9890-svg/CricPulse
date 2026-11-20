
package com.cricpulse.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String playerName;
    private String playerRole;
    private String battingStyle;
    private String bowlingStyle;
    private Integer jerseyNumber;
    private String nationality;
    private String imageUrl;

    // New Personal Information
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String motherName;
    private String address;
    private String email;
    private String collegeName;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    public Player() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public String getPlayerRole() { return playerRole; }
    public void setPlayerRole(String playerRole) { this.playerRole = playerRole; }

    public String getBattingStyle() { return battingStyle; }
    public void setBattingStyle(String battingStyle) { this.battingStyle = battingStyle; }

    public String getBowlingStyle() { return bowlingStyle; }
    public void setBowlingStyle(String bowlingStyle) { this.bowlingStyle = bowlingStyle; }

    public Integer getJerseyNumber() { return jerseyNumber; }
    public void setJerseyNumber(Integer jerseyNumber) { this.jerseyNumber = jerseyNumber; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
}
