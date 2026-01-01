package com.projectSD.authservice.controller;

import com.projectSD.authservice.dto.*;
import com.projectSD.authservice.entity.RefreshToken;
import com.projectSD.authservice.entity.UserEntity;
import com.projectSD.authservice.repository.UserRepository;
import com.projectSD.authservice.security.JwtService;
import com.projectSD.authservice.service.AuthService;
import com.projectSD.authservice.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;
    private final AuthenticationManager authManager;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final UserRepository repo;

    public AuthController(AuthService service, 
                          AuthenticationManager authManager,
                          RefreshTokenService refreshTokenService,
                          JwtService jwtService,
                          UserRepository repo) {
        this.service = service;
        this.authManager = authManager;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.repo = repo;
    }

    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest req) {
        service.register(req);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, jakarta.servlet.http.HttpServletRequest httpRequest, jakarta.servlet.http.HttpServletResponse httpResponse) {
        // Authenticate
        var authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getUsername(), req.getPassword())
        );

        UserEntity user = repo.findByUsername(req.getUsername()).orElseThrow();
        
        // Créer et enregistrer la session de sécurité
        org.springframework.security.core.context.SecurityContext context =
                org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        org.springframework.security.core.context.SecurityContextHolder.setContext(context);
        var session = httpRequest.getSession(true);
        session.setAttribute(org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        session.setAttribute("userId", user.getId());

        // Generate JWT
        String token = jwtService.generateToken(user.getUsername(), user.getRole(), user.getId());

        // Retourner le token JWT
        return ResponseEntity.ok(new LoginResponse(token, user.getRole(), user.getId()));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponse> refreshToken(HttpServletRequest request) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("refreshToken")) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (refreshToken != null) {
            return refreshTokenService.findByToken(refreshToken)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {
                        String newToken = jwtService.generateToken(user.getUsername(), user.getRole(), user.getId());
                        return ResponseEntity.ok(new LoginResponse(newToken, user.getRole(), user.getId()));
                    })
                    .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
        }
        
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
    }
}
