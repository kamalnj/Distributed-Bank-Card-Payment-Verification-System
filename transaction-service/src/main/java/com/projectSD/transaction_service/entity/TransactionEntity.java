package com.projectSD.transaction_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name="transactions")
public class TransactionEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal montant;
    private String cardNumber; // masked
    private String cardHolder;
    private String expiration;
    private String status; // SUCCESS / FAILED
    private String bankCode;
    private String bankMessage;
    private LocalDateTime createdAt;

    @PrePersist
    public void pre() { createdAt = LocalDateTime.now(); }

    // getters/setters
    public Long getId(){return id;}
    public BigDecimal getMontant(){return montant;}
    public void setMontant(BigDecimal montant){this.montant = montant;}
    public String getCardNumber(){return cardNumber;}
    public void setCardNumber(String cardNumber){this.cardNumber = cardNumber;}
    public String getCardHolder(){return cardHolder;}
    public void setCardHolder(String cardHolder){this.cardHolder = cardHolder;}
    public String getExpiration(){return expiration;}
    public void setExpiration(String expiration){this.expiration = expiration;}
    public String getStatus(){return status;}
    public void setStatus(String status){this.status = status;}
    public String getBankCode(){return bankCode;}
    public void setBankCode(String bankCode){this.bankCode = bankCode;}
    public String getBankMessage(){return bankMessage;}
    public void setBankMessage(String bankMessage){this.bankMessage = bankMessage;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
