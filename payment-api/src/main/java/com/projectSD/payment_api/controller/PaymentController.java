package com.projectSD.payment_api.controller;
import org.springframework.http.ResponseEntity;
import java.util.List;
import com.projectSD.payment_api.entity.PaymentEntity;


import com.projectSD.payment_api.dto.PaymentRequestDTO;
import com.projectSD.payment_api.dto.PaymentResponseDTO;
import com.projectSD.payment_api.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {
    private final PaymentService service;

    @PostMapping
    public PaymentResponseDTO create(@RequestBody PaymentRequestDTO dto) {
        return service.createPayment(dto);
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
