package com.projectSD.bank_core_service_rmi.impl;

import com.projectSD.bank_core_service_rmi.api.BankCoreService;
import com.projectSD.bank_core_service_rmi.api.BankResponse;
import com.projectSD.bank_core_service_rmi.model.BankCard;
import com.projectSD.bank_core_service_rmi.repository.BankCardRepository;
import org.springframework.stereotype.Service;

import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;

@Service
public class BankCoreServiceImpl extends UnicastRemoteObject implements BankCoreService {

    private final BankCardRepository repo;

    public BankCoreServiceImpl(BankCardRepository repo) throws RemoteException {
        super();
        this.repo = repo;
    }

    @Override
    public BankResponse authorizePayment(String cardNumber, String expiration, String cvv, double amount) throws RemoteException {
        System.out.println("BankCore: Authorizing payment for card: '" + cardNumber + "'");
        
        BankCard card = repo.findById(cardNumber).orElse(null);
        if (card == null) {
            System.out.println("BankCore: Card not found in DB.");
            return new BankResponse(false, "CARTE_INEXISTANTE", "Carte non trouvée");
        }
        
        if (!card.isActive()) return new BankResponse(false, "CARTE_BLOQUEE", "Carte bloquée");
        
        // Validation optionnelle pour Paiement Rapide (si exp/cvv sont fournis)
        if (expiration != null && !expiration.isBlank() && !card.getExpiration().equals(expiration)) {
             return new BankResponse(false, "CARTE_EXPIREE", "Date d'expiration non concordante");
        }
        
        if (cvv != null && !cvv.isBlank() && !card.getCvv().equals(cvv)) {
            return new BankResponse(false, "CVV_INVALIDE", "CVV invalide");
        }
        
        if (card.getBalance() < amount) return new BankResponse(false, "SOLDE_INSUFFISANT", "Solde insuffisant");

        card.setBalance(card.getBalance() - amount);
        repo.save(card);
        return new BankResponse(true, "OK", "Paiement autorisé");
    }
}
