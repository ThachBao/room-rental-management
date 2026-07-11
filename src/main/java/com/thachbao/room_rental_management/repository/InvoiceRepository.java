package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.Invoice;
import com.thachbao.room_rental_management.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByStatus(InvoiceStatus status);
    List<Invoice> findByRental_Id(Long rentalId);
    List<Invoice> findByRoom_Id(Long roomId);
    List<Invoice> findByBillingMonth(String billingMonth);
    boolean existsByRental_IdAndBillingMonth(Long rentalId, String billingMonth);

    List<Invoice> findByRental_IdIn(List<Long> rentalIds);

    @org.springframework.data.jpa.repository.Query("SELECT i FROM Invoice i WHERE " +
            "(:status IS NULL OR i.status = :status) AND " +
            "(:rentalId IS NULL OR i.rental.id = :rentalId) AND " +
            "(:roomId IS NULL OR i.room.id = :roomId) AND " +
            "(:billingMonth IS NULL OR i.billingMonth = :billingMonth)")
    List<Invoice> searchInvoices(
            @org.springframework.data.repository.query.Param("status") InvoiceStatus status,
            @org.springframework.data.repository.query.Param("rentalId") Long rentalId,
            @org.springframework.data.repository.query.Param("roomId") Long roomId,
            @org.springframework.data.repository.query.Param("billingMonth") String billingMonth);

    @org.springframework.data.jpa.repository.Query("SELECT i FROM Invoice i WHERE " +
            "(i.rental.id IN :rentalIds) AND " +
            "(:status IS NULL OR i.status = :status) AND " +
            "(:roomId IS NULL OR i.room.id = :roomId) AND " +
            "(:billingMonth IS NULL OR i.billingMonth = :billingMonth)")
    List<Invoice> searchInvoicesForTenant(
            @org.springframework.data.repository.query.Param("rentalIds") List<Long> rentalIds,
            @org.springframework.data.repository.query.Param("status") InvoiceStatus status,
            @org.springframework.data.repository.query.Param("roomId") Long roomId,
            @org.springframework.data.repository.query.Param("billingMonth") String billingMonth);
}
