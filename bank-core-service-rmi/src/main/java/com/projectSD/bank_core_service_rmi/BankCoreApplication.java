package com.projectSD.bank_core_service_rmi;

import com.projectSD.bank_core_service_rmi.model.BankCard;
import com.projectSD.bank_core_service_rmi.repository.BankCardRepository;
import com.projectSD.bank_core_service_rmi.impl.BankCoreServiceImpl;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import java.rmi.Naming;
import java.rmi.registry.LocateRegistry;

@SpringBootApplication
public class BankCoreApplication implements CommandLineRunner {

    private final ApplicationContext ctx;

    public BankCoreApplication(ApplicationContext ctx) { this.ctx = ctx; }

    public static void main(String[] args) { SpringApplication.run(BankCoreApplication.class, args); }

    @Override
    public void run(String... args) throws Exception {
        BankCardRepository repo = ctx.getBean(BankCardRepository.class);
        if (!repo.existsById("4123456789012345")) {
            var c = new BankCard("4123456789012345","2026-12","123",5000.0,true);
            repo.save(c);
        }
        LocateRegistry.createRegistry(1099);
        BankCoreServiceImpl impl = ctx.getBean(BankCoreServiceImpl.class);
        Naming.rebind("rmi://localhost:1099/bankCoreService", impl);
        System.out.println("Bank RMI bound at rmi://localhost:1099/bankCoreService");
    }
}
