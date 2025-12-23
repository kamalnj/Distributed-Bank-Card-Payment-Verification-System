package com.projectSD.authservice.service;

import com.projectSD.authservice.dto.*;
import com.projectSD.authservice.entity.UserEntity;
import com.projectSD.authservice.repository.UserRepository;
import com.projectSD.authservice.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthService(UserRepository repo,
                       PasswordEncoder encoder,
                       AuthenticationManager authManager,
                       JwtService jwtService) {
        this.repo = repo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
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
        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return new LoginResponse(token);
    }
}
