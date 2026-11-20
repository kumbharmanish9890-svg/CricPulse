
package com.cricpulse.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cricpulse.entity.Match;

public interface MatchRepository
        extends JpaRepository<Match, Long> {

}
