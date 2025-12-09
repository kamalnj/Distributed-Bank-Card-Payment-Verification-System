package com.projectSD.bank_core_service_rmi.admin.service;

import com.projectSD.bank_core_service_rmi.model.BankCard;
import com.projectSD.bank_core_service_rmi.repository.BankCardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminCardService {
    private final BankCardRepository repo;
    public AdminCardService(BankCardRepository repo) { this.repo = repo; }

    public BankCard create(BankCard card) { return repo.save(card); }
    public Optional<BankCard> get(String cardNumber) { return repo.findById(cardNumber); }
    public List<BankCard> list() { return repo.findAll(); }

    public BankCard update(String cardNumber, BankCard update) {
        return repo.findById(cardNumber).map(existing -> {
            if (update.getExpiration() != null) existing.setExpiration(update.getExpiration());
            if (update.getCvv() != null) existing.setCvv(update.getCvv());
            if (update.getBalance() != 0) existing.setBalance(update.getBalance());
            existing.setActive(update.isActive());
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Carte non trouvée"));
    }

    public void delete(String cardNumber) { repo.deleteById(cardNumber); }
    public BankCard topUp(String cardNumber, double amount) {
        var card = repo.findById(cardNumber).orElseThrow(() -> new RuntimeException("Carte non trouvée"));
        card.setBalance(card.getBalance() + amount);
        return repo.save(card);
    }
}
