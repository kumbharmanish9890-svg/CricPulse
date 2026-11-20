package com.cricpulse.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.entity.Tournament;
import com.cricpulse.repository.TournamentRepository;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentRepository tournamentRepository;

    public TournamentController(TournamentRepository tournamentRepository) {
        this.tournamentRepository = tournamentRepository;
    }

    // Get All Tournaments
    @GetMapping
    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    // Get Tournament By ID
    @GetMapping("/{id}")
    public Tournament getTournamentById(@PathVariable Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tournament Not Found"));
    }

    // Add Tournament
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Tournament addTournament(@RequestBody Tournament tournament) {

        if (tournament.getTournamentStatus() == null) {
            tournament.setTournamentStatus("UPCOMING");
        }

        return tournamentRepository.save(tournament);
    }

    // Update Tournament
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Tournament updateTournament(
            @PathVariable Long id,
            @RequestBody Tournament updatedTournament) {

        Tournament existing = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tournament Not Found"));

        existing.setTournamentName(updatedTournament.getTournamentName());
        existing.setTournamentFormat(updatedTournament.getTournamentFormat());
        existing.setTournamentStatus(updatedTournament.getTournamentStatus());
        existing.setLocation(updatedTournament.getLocation());
        existing.setStartDate(updatedTournament.getStartDate());
        existing.setEndDate(updatedTournament.getEndDate());

        return tournamentRepository.save(existing);
    }

    // Delete Tournament
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteTournament(@PathVariable Long id) {

        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tournament Not Found"));

        tournamentRepository.delete(tournament);

        return "Tournament Deleted Successfully";



    }
}