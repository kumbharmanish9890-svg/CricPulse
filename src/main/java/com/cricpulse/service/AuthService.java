
package com.cricpulse.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cricpulse.dto.LoginRequest;
import com.cricpulse.dto.RegisterRequest;
import com.cricpulse.entity.Role;
import com.cricpulse.entity.User;
import com.cricpulse.repository.UserRepository;
import com.cricpulse.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // USER REGISTRATION
    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already registered"
            );
        }

        if (request.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Admin registration is not allowed"
            );
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(
            passwordEncoder.encode(request.getPassword())
        );

        user.setRole(
            request.getRole() == null
                ? Role.VIEWER
                : request.getRole()
        );

        return userRepository.save(user);
    }

    // USER LOGIN
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            ));

        boolean passwordMatches = passwordEncoder.matches(
            request.getPassword(),
            user.getPassword()
        );

        if (!passwordMatches) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        return jwtService.generateToken(user);
    }
}
