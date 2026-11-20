
package com.cricpulse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cricpulse.entity.BallDelivery;

@Repository
public interface BallDeliveryRepository extends JpaRepository<BallDelivery, Long> {

    List<BallDelivery> findByInningsId(Long inningsId);

    List<BallDelivery> findByInningsIdOrderByOverNumberAscBallNumberAsc(Long inningsId);

    long countByInningsId(Long inningsId);
}
