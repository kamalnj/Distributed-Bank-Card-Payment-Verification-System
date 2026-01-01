package com.projectSD.payment_api.service;

import com.projectSD.payment_api.entity.MobileTokenEntity;
import com.projectSD.payment_api.repository.MobileTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MobileTokenService {

    private final MobileTokenRepository repo;
    private static final SecureRandom RNG = new SecureRandom();

    public static String randomToken() {
        byte[] buf = new byte[32];
        RNG.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    public static String sha256(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] out = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : out) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String generateTokenForUser(Long userId, Integer ttlDays) {
        String token = randomToken();
        String hash = sha256(token);
        MobileTokenEntity entity = new MobileTokenEntity();
        entity.setUserId(userId);
        entity.setTokenHash(hash);
        if (ttlDays != null && ttlDays > 0) {
            entity.setExpiresAt(LocalDateTime.now().plusDays(ttlDays));
        }
        repo.save(entity);
        return token;
    }

    public Optional<Long> validate(String token, String installationId) {
        String hash = sha256(token);
        Optional<MobileTokenEntity> opt = repo.findActiveByHash(hash, LocalDateTime.now());
        if (opt.isEmpty()) return Optional.empty();
        MobileTokenEntity t = opt.get();
        if (t.getInstallationId() == null && installationId != null && !installationId.isBlank()) {
            t.setInstallationId(installationId);
            repo.save(t);
        } else if (t.getInstallationId() != null && installationId != null && !t.getInstallationId().equals(installationId)) {
            return Optional.empty();
        }
        t.setLastUsedAt(LocalDateTime.now());
        repo.save(t);
        return Optional.ofNullable(t.getUserId());
    }

    public void revoke(Long id) {
        repo.findById(id).ifPresent(t -> {
            t.setStatus("REVOKED");
            t.setRevokedAt(LocalDateTime.now());
            repo.save(t);
        });
    }
}
