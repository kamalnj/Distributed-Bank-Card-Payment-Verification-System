package com.projectSD.bank_core_service_rmi.admin.dto;

public class CardUpdateDTO {
    private String expiration;
    private String cvv;
    private Double balance;
    private Boolean active;

    public CardUpdateDTO() {}
    public String getExpiration() { return expiration; }
    public void setExpiration(String expiration) { this.expiration = expiration; }
    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
