package com.projectSD.transaction_service.controller;

import com.projectSD.transaction_service.dto.PaymentRequestDTO;
import com.projectSD.transaction_service.dto.TransactionResponse;
import com.projectSD.transaction_service.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    @PostMapping
    public TransactionResponse process(@RequestBody PaymentRequestDTO dto) {
        return service.process(dto);
    }
}
