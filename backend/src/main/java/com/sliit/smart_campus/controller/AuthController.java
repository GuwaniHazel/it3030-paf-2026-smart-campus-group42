package com.sliit.smart_campus.controller;

import com.sliit.smart_campus.dto.AuthResponse;
import com.sliit.smart_campus.dto.LoginRequest;
import com.sliit.smart_campus.dto.RegisterRequest;
import com.sliit.smart_campus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse authResponse = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("AuthController.me not implemented yet");
    }
}
