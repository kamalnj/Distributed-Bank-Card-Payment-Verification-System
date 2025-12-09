package com.projectSD.bank_core_service_rmi.api;

import java.rmi.Remote;
import java.rmi.RemoteException;

public interface BankCoreService extends Remote {
    BankResponse authorizePayment(String cardNumber, String expiration, String cvv, double amount) throws RemoteException;
}
