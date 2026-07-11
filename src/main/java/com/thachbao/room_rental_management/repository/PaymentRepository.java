package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByInvoice_Id(Long invoiceId);
    boolean existsByInvoice_Id(Long invoiceId);
    List<Payment> findByReceivedByUser_Id(Long receivedByUserId);
    List<Payment> findByInvoice_Rental_IdIn(List<Long> rentalIds);
}
