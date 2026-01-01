package com.projectSD.payment_api.repository;

import com.projectSD.payment_api.entity.MobileTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface MobileTokenRepository extends JpaRepository<MobileTokenEntity, Long> {

    @Query("select t from MobileTokenEntity t where t.tokenHash = :hash and t.status = 'ACTIVE' and (t.revokedAt is null) and (t.expiresAt is null or t.expiresAt > :now)")
    Optional<MobileTokenEntity> findActiveByHash(@Param("hash") String hash, @Param("now") LocalDateTime now);
}
