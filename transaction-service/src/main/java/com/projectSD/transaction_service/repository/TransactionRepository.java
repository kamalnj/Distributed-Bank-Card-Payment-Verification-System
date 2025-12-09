package com.projectSD.transaction_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projectSD.transaction_service.entity.TransactionEntity;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> { }
