package com.projectSD.bank_core_service_rmi.api;

import java.io.Serializable;

public class BankResponse implements Serializable {
    private boolean success;
    private String code;
    private String message;

    public BankResponse() {}

    public BankResponse(boolean success, String code, String message) {
        this.success = success;
        this.code = code;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public String getCode() { return code; }
    public String getMessage() { return message; }
    public void setSuccess(boolean success) { this.success = success; }
    public void setCode(String code) { this.code = code; }
    public void setMessage(String message) { this.message = message; }
}
