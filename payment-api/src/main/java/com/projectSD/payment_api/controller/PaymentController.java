package com.projectSD.payment_api.controller;

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
}
