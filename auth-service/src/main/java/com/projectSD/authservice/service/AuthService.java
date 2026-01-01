package com.projectSD.authservice.service;

import com.projectSD.authservice.dto.*;
import com.projectSD.authservice.entity.UserEntity;
import com.projectSD.authservice.repository.UserRepository;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;

    public AuthService(UserRepository repo,
                       PasswordEncoder encoder,
                       AuthenticationManager authManager) {
        this.repo = repo;
        this.encoder = encoder;
        this.authManager = authManager;
    }

    public void register(RegisterRequest req) {
        UserEntity user = UserEntity.builder()
                .username(req.getUsername())
                .password(encoder.encode(req.getPassword()))
                .role(req.getRole())
                .build();
        repo.save(user);
    }

    public LoginResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getUsername(), req.getPassword())
        );

        UserEntity user = repo.findByUsername(req.getUsername()).get();
        logger.debug("Creating session login response for user: {}, ID: {}", user.getUsername(), user.getId());
        return new LoginResponse("SESSION", user.getRole(), user.getId());
    }
}
