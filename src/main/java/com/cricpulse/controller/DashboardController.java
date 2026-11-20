
package com.cricpulse.controller;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> adminDashboard() {

        return Map.of(
            "dashboard", "Admin Dashboard",
            "message", "Welcome Admin!",
            "role", "ADMIN"
        );
    }

    @GetMapping("/scorer")
    @PreAuthorize("hasAnyRole('SCORER', 'ADMIN')")
    public Map<String, String> scorerDashboard() {

        return Map.of(
            "dashboard", "Scorer Dashboard",
            "message", "Welcome Scorer!",
            "role", "SCORER"
        );
    }

    @GetMapping("/team-manager")
    @PreAuthorize("hasAnyRole('TEAM_MANAGER', 'ADMIN')")
    public Map<String, String> teamManagerDashboard() {

        return Map.of(
            "dashboard", "Team Manager Dashboard",
            "message", "Welcome Team Manager!",
            "role", "TEAM_MANAGER"
        );
    }

    @GetMapping("/viewer")
    @PreAuthorize("hasAnyRole('VIEWER', 'ADMIN')")
    public Map<String, String> viewerDashboard() {

        return Map.of(
            "dashboard", "Viewer Dashboard",
            "message", "Welcome Viewer!",
            "role", "VIEWER"
        );
    }
}
