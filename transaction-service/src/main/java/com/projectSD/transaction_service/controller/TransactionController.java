package com.projectSD.transaction_service.controller;
import org.springframework.http.ResponseEntity;
import java.util.List;



import com.projectSD.transaction_service.dto.PaymentRequestDTO;
import com.projectSD.transaction_service.dto.TransactionResponse;
import com.projectSD.transaction_service.service.TransactionService;
import com.projectSD.transaction_service.entity.TransactionEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TransactionController {

    private final TransactionService service;

    @PostMapping
    public TransactionResponse process(@RequestBody PaymentRequestDTO dto) {
        return service.process(dto);
    }
        // ✅ GET : liste des transactions
    @GetMapping("/list")
    public ResponseEntity<List<TransactionEntity>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    // ✅ GET : une transaction
    @GetMapping("/{id}")
    public ResponseEntity<TransactionEntity> get(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
