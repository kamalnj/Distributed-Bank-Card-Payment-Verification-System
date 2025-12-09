package com.projectSD.payment_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projectSD.payment_api.entity.PaymentEntity;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> { }
