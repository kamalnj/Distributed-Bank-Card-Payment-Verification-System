package com.projectSD.transaction_service.config;

import com.projectSD.bank_core_service_rmi.api.BankCoreService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.rmi.Naming;

@Configuration
public class RmiClientConfig {

    @Bean
    public BankCoreService bankCoreService() throws Exception {
        return (BankCoreService) Naming.lookup("rmi://localhost:1099/bankCoreService");
    }
}
