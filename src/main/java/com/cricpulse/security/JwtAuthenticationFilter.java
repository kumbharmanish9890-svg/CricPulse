
package com.cricpulse.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // DEBUG 1: Check whether JWT filter is called
        System.out.println("JWT FILTER CALLED: "
                + request.getMethod() + " "
                + request.getRequestURI());

        String header = request.getHeader("Authorization");

        // DEBUG 2: Check Authorization header
        System.out.println("AUTH HEADER PRESENT: "
                + (header != null && header.startsWith("Bearer ")));

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            String email = jwtService.extractEmail(token);

            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                // DEBUG 3: Check user authorities
                System.out.println("JWT AUTHORITIES: "
                        + userDetails.getAuthorities());

                // DEBUG 4: Check database role
                if (userDetails instanceof com.cricpulse.entity.User user) {
                    System.out.println("JWT ROLE: " + user.getRole());

                    if (jwtService.isTokenValid(token, user)) {

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities());

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request));

                        SecurityContextHolder.getContext()
                                .setAuthentication(authentication);

                        // DEBUG 5: Authentication successful
                        System.out.println("JWT AUTHENTICATION SUCCESS");
                    } else {
                        System.out.println("JWT TOKEN VALIDATION FAILED");
                    }
                }
            }

        } catch (JwtException | IllegalArgumentException
                | UsernameNotFoundException e) {

            System.out.println("JWT ERROR: " + e.getMessage());

            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"message\":\"Invalid or expired token\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
