
package com.cricpulse.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.cricpulse.entity.Match;
import com.cricpulse.repository.MatchRepository;

@Component
public class DataLoader implements CommandLineRunner {

    private final MatchRepository matchRepository;

    public DataLoader(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    @Override
    public void run(String... args) {

        if (matchRepository.count() == 0) {

            Match match1 = new Match(
                "India",
                "Australia",
                "Mumbai",
                "UPCOMING",
                "T20",
                LocalDateTime.now().plusDays(1)
            );

            Match match2 = new Match(
                "England",
                "South Africa",
                "Pune",
                "UPCOMING",
                "ODI",
                LocalDateTime.now().plusDays(2)
            );

            matchRepository.save(match1);
            matchRepository.save(match2);

            System.out.println("Sample Matches Added!");
        }
    }
}
