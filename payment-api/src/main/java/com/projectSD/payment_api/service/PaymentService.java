package com.projectSD.payment_api.service;
import java.util.List;
import java.util.Optional;


import com.projectSD.payment_api.dto.PaymentRequestDTO;
import com.projectSD.payment_api.dto.PaymentResponseDTO;
import com.projectSD.payment_api.entity.PaymentEntity;
import com.projectSD.payment_api.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RestTemplate restTemplate;
    private final PaymentRepository paymentRepository;

    @Value("${transaction.service.url}")
    private String transactionServiceUrl;

    public PaymentResponseDTO createPayment(PaymentRequestDTO dto, Long userId) {

        // 1️⃣ Validation minimale
        if (dto.getMontant() == null || dto.getMontant().doubleValue() <= 0) {
            throw new IllegalArgumentException("Montant invalide");
        }

        // 2️⃣ Sauvegarde initiale du paiement
        PaymentEntity pay = new PaymentEntity();
        pay.setMontant(dto.getMontant());
        pay.setStatus("CREATED");
        pay.setUserId(userId);

        if (dto.getNumeroCarte() != null && dto.getNumeroCarte().length() >= 4) {
            pay.setCardLast4(dto.getNumeroCarte()
                .substring(dto.getNumeroCarte().length() - 4));
        }

        // Use the returned entity to ensure we have the managed instance (with ID)
        pay = paymentRepository.save(pay);

        // Injecter userId dans le DTO pour le service de transaction
        dto.setUserId(userId);

        // 3️⃣ Appel transaction-service
        PaymentResponseDTO txResp =
            restTemplate.postForObject(
                transactionServiceUrl + "/api/transactions",
                dto,
                PaymentResponseDTO.class
            );

        // 4️⃣ Mise à jour du paiement selon la réponse banque
        pay.setStatus(txResp.isSuccess() ? "SUCCESS" : "FAILED");
        // Save again using the managed instance
        paymentRepository.save(pay);

        // 5️⃣ Renvoi FINAL vers le frontend
        PaymentResponseDTO out = new PaymentResponseDTO();
        out.setSuccess(txResp.isSuccess());
        out.setMessage(txResp.getMessage());
        out.setCode(txResp.getCode());
        out.setTransactionId(txResp.getTransactionId());

        return out;
    }

        public List<PaymentEntity> findAll() {
        return paymentRepository.findAll();
    }

    public Optional<PaymentEntity> findById(Long id) {
        return paymentRepository.findById(id);
    }
}
