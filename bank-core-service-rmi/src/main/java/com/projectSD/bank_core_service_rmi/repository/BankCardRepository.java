package com.projectSD.bank_core_service_rmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projectSD.bank_core_service_rmi.model.BankCard;

public interface BankCardRepository extends JpaRepository<BankCard, String> { }
