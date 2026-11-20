
package com.cricpulse.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.entity.Player;
import com.cricpulse.entity.Team;
import com.cricpulse.repository.MatchSquadRepository;
import com.cricpulse.repository.PlayerRepository;
import com.cricpulse.repository.TeamRepository;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "http://localhost:5173")
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final MatchSquadRepository matchSquadRepository;

    public PlayerController(
            PlayerRepository playerRepository,
            TeamRepository teamRepository,
            MatchSquadRepository matchSquadRepository) {

        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.matchSquadRepository = matchSquadRepository;
    }

    // GET ALL PLAYERS - ALL ROLES
    @GetMapping
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    // GET PLAYERS BY TEAM ID - ALL ROLES
    @GetMapping("/team/{teamId}")
    public List<Player> getPlayersByTeam(@PathVariable Long teamId) {
        return playerRepository.findByTeamId(teamId);
    }

    // GET PLAYER BY ID - ALL ROLES
    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable Long id) {

        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Player not found"));

        return ResponseEntity.ok(player);
    }

    // SEARCH PLAYER BY NAME
    @GetMapping("/search")
    public List<Player> searchPlayers(@RequestParam String name) {
        return playerRepository.findByPlayerNameContainingIgnoreCase(name);
    }

    // SEARCH PLAYER BY CONTACT NUMBER
    @GetMapping("/search/contact")
    public List<Player> searchByContact(@RequestParam String contact) {
        return playerRepository.findByContactNumberContaining(contact);
    }

    // SEARCH PLAYER BY EMAIL
    @GetMapping("/search/email")
    public List<Player> searchByEmail(@RequestParam String email) {
        return playerRepository.findByEmailContainingIgnoreCase(email);
    }

    // ADD PLAYER TO TEAM - ADMIN AND SCORER
    @PostMapping("/team/{teamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCORER')")
    public ResponseEntity<Player> addPlayer(
            @PathVariable Long teamId,
            @RequestBody Player player) {

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Team not found"));

        player.setId(null);
        player.setTeam(team);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playerRepository.save(player));
    }

    // UPDATE PLAYER - ADMIN AND SCORER
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCORER')")
    public ResponseEntity<Player> updatePlayer(
            @PathVariable Long id,
            @RequestBody Player updatedPlayer) {

        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Player not found"));

        player.setPlayerName(updatedPlayer.getPlayerName());
        player.setPlayerRole(updatedPlayer.getPlayerRole());
        player.setBattingStyle(updatedPlayer.getBattingStyle());
        player.setBowlingStyle(updatedPlayer.getBowlingStyle());
        player.setJerseyNumber(updatedPlayer.getJerseyNumber());
        player.setNationality(updatedPlayer.getNationality());

        // Personal Information
        player.setDateOfBirth(updatedPlayer.getDateOfBirth());
        player.setContactNumber(updatedPlayer.getContactNumber());
        player.setMotherName(updatedPlayer.getMotherName());
        player.setAddress(updatedPlayer.getAddress());
        player.setEmail(updatedPlayer.getEmail());
        player.setCollegeName(updatedPlayer.getCollegeName());

        // Update team only when team ID is supplied
        if (updatedPlayer.getTeam() != null
                && updatedPlayer.getTeam().getId() != null) {

            Team team = teamRepository.findById(
                    updatedPlayer.getTeam().getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Team not found"));

            player.setTeam(team);
        }

        return ResponseEntity.ok(playerRepository.save(player));
    }

    // DELETE PLAYER - ADMIN AND SCORER
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCORER')")
    public ResponseEntity<String> deletePlayer(@PathVariable Long id) {

        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Player not found"));

        boolean assignedToMatchSquad = matchSquadRepository.findAll()
                .stream()
                .anyMatch(matchSquad ->
                        matchSquad.getPlayer() != null
                        && matchSquad.getPlayer().getId() != null
                        && matchSquad.getPlayer().getId().equals(id));

        if (assignedToMatchSquad) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete this player because the player is assigned to a match squad.");
        }

        playerRepository.delete(player);

        return ResponseEntity.ok("Player deleted successfully");
    }

    // UPLOAD PLAYER PROFILE IMAGE - ADMIN AND SCORER
    @PostMapping(value = "/{id}/image", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCORER')")
    public ResponseEntity<Player> uploadPlayerImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {
            Player player = playerRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Player not found"));

            if (file.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Please select an image");
            }

            String contentType = file.getContentType();

            if (contentType == null ||
                    !(contentType.equals("image/jpeg")
                    || contentType.equals("image/png")
                    || contentType.equals("image/webp"))) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only JPG, PNG and WEBP images are allowed");
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Image size must be less than 5 MB");
            }

            String extension = switch (contentType) {
                case "image/jpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid image format");
            };

            String fileName = UUID.randomUUID() + extension;

            Path uploadPath = Paths.get("uploads", "players");
            Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            player.setImageUrl("/uploads/players/" + fileName);

            return ResponseEntity.ok(playerRepository.save(player));

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to upload player image");
        }
    }
}
