package com.projectSD.bank_core_service_rmi.admin.controller;

import com.projectSD.bank_core_service_rmi.admin.dto.CardCreateDTO;
import com.projectSD.bank_core_service_rmi.admin.dto.CardUpdateDTO;
import com.projectSD.bank_core_service_rmi.admin.service.AdminCardService;
import com.projectSD.bank_core_service_rmi.model.BankCard;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/cards")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminCardController {
    private final AdminCardService service;

    @PostMapping
    public ResponseEntity<BankCard> create(@RequestBody CardCreateDTO dto) {
        BankCard card = new BankCard(dto.getCardNumber(), dto.getExpiration(), dto.getCvv(), dto.getBalance(), dto.isActive());
        return ResponseEntity.ok(service.create(card));
    }

    @GetMapping("/{cardNumber}")
    public ResponseEntity<BankCard> get(@PathVariable String cardNumber) {
        return service.get(cardNumber).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<BankCard>> list() { return ResponseEntity.ok(service.list()); }

    @PutMapping("/{cardNumber}")
    public ResponseEntity<BankCard> update(@PathVariable String cardNumber, @RequestBody CardUpdateDTO dto) {
        BankCard update = new BankCard();
        update.setExpiration(dto.getExpiration());
        update.setCvv(dto.getCvv());
        if (dto.getBalance() != null) update.setBalance(dto.getBalance());
        if (dto.getActive() != null) update.setActive(dto.getActive());
        return ResponseEntity.ok(service.update(cardNumber, update));
    }

    @PostMapping("/{cardNumber}/topup")
    public ResponseEntity<BankCard> topUp(@PathVariable String cardNumber, @RequestParam double amount) {
        return ResponseEntity.ok(service.topUp(cardNumber, amount));
    }

    @DeleteMapping("/{cardNumber}")
    public ResponseEntity<Void> delete(@PathVariable String cardNumber) {
        service.delete(cardNumber);
        return ResponseEntity.noContent().build();
    }
}
