package com.projectSD.transaction_service.dto;
import java.math.BigDecimal;

public class PaymentRequestDTO {
    private BigDecimal montant;
    private String numeroCarte;
    private String expiration;
    private String cvv;
    private String nomClient;

    public PaymentRequestDTO() {}
    // getters/setters
    public BigDecimal getMontant(){return montant;}
    public void setMontant(BigDecimal montant){this.montant=montant;}
    public String getNumeroCarte(){return numeroCarte;}
    public void setNumeroCarte(String numeroCarte){this.numeroCarte = numeroCarte;}
    public String getExpiration(){return expiration;}
    public void setExpiration(String expiration){this.expiration = expiration;}
    public String getCvv(){return cvv;}
    public void setCvv(String cvv){this.cvv = cvv;}
    public String getNomClient(){return nomClient;}
    public void setNomClient(String nomClient){this.nomClient = nomClient;}
}
