
package com.cricpulse.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.cricpulse.security.JwtAuthenticationFilter;

@EnableWebSecurity
@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // Dashboard Permissions
                .requestMatchers(HttpMethod.GET, "/api/dashboard/admin")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/dashboard/scorer")
                    .hasAnyRole("SCORER", "ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/dashboard/team-manager")
                    .hasAnyRole("TEAM_MANAGER", "ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/dashboard/viewer")
                    .hasAnyRole("VIEWER", "ADMIN")

                // Authentication
                .requestMatchers("/api/auth/**").permitAll()

                // Match History
                .requestMatchers(HttpMethod.GET, "/api/matches/history")
                    .permitAll()

                // Matches
                .requestMatchers(HttpMethod.GET, "/api/matches", "/api/matches/**")
                    .permitAll()

                .requestMatchers(HttpMethod.POST, "/api/matches", "/api/matches/**")
                    .hasAnyRole("ADMIN", "SCORER")

                .requestMatchers(HttpMethod.PUT, "/api/matches", "/api/matches/**")
                    .hasAnyRole("ADMIN", "SCORER")

                .requestMatchers(HttpMethod.DELETE, "/api/matches", "/api/matches/**")
                    .hasRole("ADMIN")

                // Tournaments
                .requestMatchers(HttpMethod.GET, "/api/tournaments", "/api/tournaments/**")
                    .permitAll()

                .requestMatchers(HttpMethod.POST, "/api/tournaments", "/api/tournaments/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT, "/api/tournaments", "/api/tournaments/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE, "/api/tournaments", "/api/tournaments/**")
                    .hasRole("ADMIN")

                // Player Image Upload
                .requestMatchers(HttpMethod.POST, "/api/players/*/image")
                    .hasRole("ADMIN")

                // Teams
                .requestMatchers(HttpMethod.GET, "/api/teams", "/api/teams/**")
                    .permitAll()

                .requestMatchers(HttpMethod.POST, "/api/teams", "/api/teams/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT, "/api/teams", "/api/teams/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE, "/api/teams", "/api/teams/**")
                    .hasRole("ADMIN")

                 // Players - View All Roles
                    .requestMatchers(HttpMethod.GET, "/api/players", "/api/players/**")
                        .hasAnyRole("ADMIN", "SCORER", "TEAM_MANAGER", "VIEWER")

                    // Players - Add, Update, Delete: ADMIN + SCORER
                    .requestMatchers(HttpMethod.POST, "/api/players", "/api/players/**")
                        .hasAnyRole("ADMIN", "SCORER")

                    .requestMatchers(HttpMethod.PUT, "/api/players", "/api/players/**")
                        .hasAnyRole("ADMIN", "SCORER")

                    .requestMatchers(HttpMethod.DELETE, "/api/players", "/api/players/**")
                        .hasAnyRole("ADMIN", "SCORER")
                // Match Squads
                .requestMatchers(HttpMethod.POST, "/api/match-squads/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT, "/api/match-squads/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/match-squads/**")
                    .permitAll()

                // Toss
                .requestMatchers(HttpMethod.GET, "/api/toss/**")
                    .permitAll()

                .requestMatchers(HttpMethod.POST, "/api/toss/**")
                    .hasRole("ADMIN")

                // Innings
                .requestMatchers(HttpMethod.GET, "/api/innings", "/api/innings/**")
                    .permitAll()

                .requestMatchers(HttpMethod.POST, "/api/innings", "/api/innings/**")
                    .hasAnyRole("ADMIN", "SCORER")

                .requestMatchers(HttpMethod.PUT, "/api/innings", "/api/innings/**")
                    .hasAnyRole("ADMIN", "SCORER")

                // Ball-by-Ball Scoring
                .requestMatchers(HttpMethod.GET, "/api/ball-deliveries", "/api/ball-deliveries/**")
                    .permitAll()

                .requestMatchers(HttpMethod.POST, "/api/ball-deliveries", "/api/ball-deliveries/**")
                    .hasAnyRole("ADMIN", "SCORER")

                // Player Statistics - NEW RULE
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/player-statistics",
                    "/api/player-statistics/**"
                ).permitAll()

                // Points Table
                .requestMatchers(HttpMethod.GET, "/api/points-table", "/api/points-table/**")
                    .permitAll()

                .requestMatchers(HttpMethod.POST, "/api/points-table", "/api/points-table/**")
                    .hasRole("ADMIN")

                // Player Images
                .requestMatchers("/uploads/players/**")
                    .permitAll()
            )

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // JWT Filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
            List.of("http://localhost:5173")
        );

        config.setAllowedMethods(
            List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
