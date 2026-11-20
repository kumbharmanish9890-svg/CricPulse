
package com.cricpulse.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cricpulse.dto.LoginRequest;
import com.cricpulse.dto.RegisterRequest;
import com.cricpulse.entity.User;
import com.cricpulse.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // REGISTRATION API
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        Map<String, Object> response = Map.of(
            "message", "Registration successful",
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // LOGIN API
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        String token = authService.login(request);

        Map<String, Object> response = Map.of(
            "message", "Login successful",
            "token", token
        );

        return ResponseEntity.ok(response);
    }
}
