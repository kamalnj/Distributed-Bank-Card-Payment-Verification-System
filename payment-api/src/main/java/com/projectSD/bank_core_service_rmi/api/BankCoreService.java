package com.projectSD.bank_core_service_rmi.api;

import java.rmi.Remote;
import java.rmi.RemoteException;

public interface BankCoreService extends Remote {

    String processPayment(
            double montant,
            String numeroCarte,
            String expiration,
            String cvv,
            String nomClient
    ) throws RemoteException;
}
