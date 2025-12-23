package com.projectSD.payment_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "payments")
public class PaymentEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal montant;
    private String cardLast4;
    private String cardBrand;
    private String status;
    private LocalDateTime createdAt;

    @PrePersist
    public void pre() { createdAt = LocalDateTime.now(); }

    // getters/setters
    public Long getId(){return id;}
    public BigDecimal getMontant(){return montant;}
    public void setMontant(BigDecimal montant){this.montant = montant;}
    public String getCardLast4(){return cardLast4;}
    public void setCardLast4(String cardLast4){this.cardLast4 = cardLast4;}
    public String getCardBrand(){return cardBrand;}
    public void setCardBrand(String cardBrand){this.cardBrand = cardBrand;}
    public String getStatus(){return status;}
    public void setStatus(String status){this.status = status;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
