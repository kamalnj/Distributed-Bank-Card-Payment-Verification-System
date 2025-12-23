package com.projectSD.bank_core_service_rmi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.security.Key;

public class JwtUtil {

    private static final String SECRET =
            "MySuperSecretKeyForJwtHS256Algorithm2025!!";

    private static final Key KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    public static Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
