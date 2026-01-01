package com.projectSD.payment_api.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        
        // LOGGING
        System.out.println("JwtAuthFilter: Processing request " + request.getRequestURI());

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("JwtAuthFilter: Found Bearer token: " + token.substring(0, Math.min(10, token.length())) + "...");

            try {
                Claims claims = jwtUtil.extractClaims(token);
                String username = claims.getSubject();
                String role = claims.get("role", String.class);
                
                System.out.println("JwtAuthFilter: Claims extracted. Username: " + username + ", Role: " + role);

                var auth = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        List.of(new SimpleGrantedAuthority(role))
                );
                auth.setDetails(claims); 

                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println("JwtAuthFilter: Authentication set in context.");
            } catch (Exception e) {
                System.err.println("JwtAuthFilter: Error validating token: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("JwtAuthFilter: No Bearer token found in header.");
        }

        filterChain.doFilter(request, response);
    }
}
