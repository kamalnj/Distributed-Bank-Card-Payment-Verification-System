package com.projectSD.transaction_service.dto;

public class TransactionResponse {
    private boolean success;
    private String code;
    private String message;
    private Long transactionId;

    public TransactionResponse() {}
    public TransactionResponse(boolean success, String code, String message, Long transactionId) {
        this.success = success; this.code = code; this.message = message; this.transactionId = transactionId;
    }

    // getters/setters
    public boolean isSuccess(){return success;}
    public void setSuccess(boolean success){this.success = success;}
    public String getCode(){return code;}
    public void setCode(String code){this.code = code;}
    public String getMessage(){return message;}
    public void setMessage(String message){this.message = message;}
    public Long getTransactionId(){return transactionId;}
    public void setTransactionId(Long transactionId){this.transactionId = transactionId;}
}
