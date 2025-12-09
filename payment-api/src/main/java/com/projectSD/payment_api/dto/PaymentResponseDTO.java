package com.projectSD.payment_api.dto;

public class PaymentResponseDTO {
    private boolean success;
    private String message;
    private String code;
    private String transactionId;

    public PaymentResponseDTO() {}
    public PaymentResponseDTO(boolean success, String message, String transactionId){
        this.success = success; this.message = message; this.transactionId = transactionId;
    }
    // getters/setters
    public boolean isSuccess(){return success;}
    public void setSuccess(boolean success){this.success = success;}
    public String getMessage(){return message;}
    public void setMessage(String message){this.message = message;}
    public String getCode(){return code;}
    public void setCode(String code){this.code = code;}
    public String getTransactionId(){return transactionId;}
    public void setTransactionId(String transactionId){this.transactionId = transactionId;}
}
