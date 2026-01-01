package com.projectSD.payment_api.controller;

import com.projectSD.payment_api.service.MobileTokenService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mobile-token")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MobileTokenController {

    private final MobileTokenService service;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generate(@RequestParam(required = false) Integer ttlDays) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Long userId = null;
        Object details = auth.getDetails();
        if (details instanceof Claims) {
            Claims claims = (Claims) details;
            // Try different claim names for user ID
            if (claims.get("userId") != null) userId = claims.get("userId", Long.class);
            else if (claims.get("id") != null) userId = claims.get("id", Long.class);
            else if (claims.get("user_id") != null) userId = claims.get("user_id", Long.class);
            
            // If still null, try to parse subject if it's numeric
            if (userId == null && claims.getSubject() != null) {
                try {
                    userId = Long.parseLong(claims.getSubject());
                } catch (NumberFormatException ignored) {}
            }
        }

        if (userId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "User ID not found in token"));
        }

        String token = service.generateTokenForUser(userId, ttlDays);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/revoke/{id}")
    public ResponseEntity<Void> revoke(@PathVariable Long id) {
        service.revoke(id);
        return ResponseEntity.noContent().build();
    }
}
