package com.projectSD.payment_api.controller;
import org.springframework.http.ResponseEntity;
import java.util.List;
import com.projectSD.payment_api.entity.PaymentEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import com.projectSD.payment_api.dto.PaymentRequestDTO;
import com.projectSD.payment_api.dto.PaymentResponseDTO;
import com.projectSD.payment_api.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.projectSD.payment_api.service.MobileTokenService;

@RestController
@RequestMapping("/merchant/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService service;
    private final MobileTokenService mobileTokenService;

    @PostMapping
    public PaymentResponseDTO create(@RequestBody PaymentRequestDTO dto, HttpServletRequest request) {
        Long userId = null;
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String installationId = request.getHeader("X-Installation-Id");
            var uidOpt = mobileTokenService.validate(token, installationId);
            if (uidOpt.isPresent()) {
                userId = uidOpt.get();
            }
        }
        var session = request.getSession(false);
        if (session != null) {
            Object uid = session.getAttribute("userId");
            if (uid instanceof Number) {
                if (userId == null) {
                    userId = ((Number) uid).longValue();
                }
            }
        }

        return service.createPayment(dto, userId);
    }

        @GetMapping("/list")
    public ResponseEntity<List<PaymentEntity>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    // ✅ GET : un seul paimement
    @GetMapping("/{id}")
    public ResponseEntity<PaymentEntity> get(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
