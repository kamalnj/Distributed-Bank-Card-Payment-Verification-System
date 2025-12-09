package com.projectSD.transaction_service.service;
import java.util.List;
import java.util.Optional;
import com.projectSD.transaction_service.dto.PaymentRequestDTO;
import com.projectSD.transaction_service.dto.TransactionResponse;
import com.projectSD.transaction_service.entity.TransactionEntity;
import com.projectSD.transaction_service.repository.TransactionRepository;
import com.projectSD.bank_core_service_rmi.api.BankCoreService;
import com.projectSD.bank_core_service_rmi.api.BankResponse;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository repo;
    private final BankCoreService bankService;

    public TransactionResponse process(PaymentRequestDTO dto) {
        try {
            BankResponse bankResp = bankService.authorizePayment(
                dto.getNumeroCarte(),
                dto.getExpiration(),
                dto.getCvv(),
                dto.getMontant().doubleValue()
            );

            TransactionEntity tx = new TransactionEntity();
            tx.setMontant(dto.getMontant());
            tx.setCardNumber(mask(dto.getNumeroCarte()));
            tx.setCardHolder(dto.getNomClient());
            tx.setExpiration(dto.getExpiration());
            tx.setStatus(bankResp.isSuccess() ? "SUCCESS" : "FAILED");
            tx.setBankCode(bankResp.getCode());
            tx.setBankMessage(bankResp.getMessage());
            repo.save(tx);

            TransactionResponse resp = new TransactionResponse();
            resp.setSuccess(bankResp.isSuccess());
            resp.setCode(bankResp.getCode());
            resp.setMessage(bankResp.getMessage());
            resp.setTransactionId(tx.getId());
            return resp;
        } catch (Exception ex) {
            throw new RuntimeException("RMI error: " + ex.getMessage(), ex);
        }
    }

    public List<TransactionEntity> findAll() {
        return repo.findAll();
    }

    public Optional<TransactionEntity> findById(Long id) {
        return repo.findById(id);
    }

    private String mask(String card){
        if(card == null) return null;
        if(card.length() < 4) return "****";
        return "**** **** **** " + card.substring(card.length()-4);
    }
}
