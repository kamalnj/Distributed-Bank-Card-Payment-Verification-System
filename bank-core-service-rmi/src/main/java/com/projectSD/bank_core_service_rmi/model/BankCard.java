package com.projectSD.bank_core_service_rmi.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bank_cards")
public class BankCard {
    @Id
    private String cardNumber;
    private String expiration; // YYYY-MM
    private String cvv;
    private double balance;
    private boolean active;

    public BankCard() {}

    public BankCard(String cardNumber, String expiration, String cvv, double balance, boolean active) {
        this.cardNumber = cardNumber;
        this.expiration = expiration;
        this.cvv = cvv;
        this.balance = balance;
        this.active = active;
    }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    public String getExpiration() { return expiration; }
    public void setExpiration(String expiration) { this.expiration = expiration; }
    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
