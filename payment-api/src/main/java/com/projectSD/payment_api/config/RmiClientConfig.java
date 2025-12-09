package com.projectSD.payment_api.config;

import com.projectSD.bank_core_service_rmi.api.BankCoreService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.rmi.Naming;

@Configuration
public class RmiClientConfig {

    @Value("${bank.rmi.url:rmi://localhost:1099/bankCoreService}")
    private String rmiUrl;

    @Bean
    public BankCoreService bankCoreService() throws Exception {
        return (BankCoreService) Naming.lookup(rmiUrl);
    }
}
