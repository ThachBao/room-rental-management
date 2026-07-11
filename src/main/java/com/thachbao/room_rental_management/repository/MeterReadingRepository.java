package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {
    List<MeterReading> findByRental_Id(Long rentalId);
    List<MeterReading> findByRoom_Id(Long roomId);
    List<MeterReading> findByBillingMonth(String billingMonth);
    boolean existsByRental_IdAndBillingMonth(Long rentalId, String billingMonth);
    Optional<MeterReading> findByRental_IdAndBillingMonth(Long rentalId, String billingMonth);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM MeterReading m WHERE " +
            "(:rentalId IS NULL OR m.rental.id = :rentalId) AND " +
            "(:roomId IS NULL OR m.room.id = :roomId) AND " +
            "(:billingMonth IS NULL OR m.billingMonth = :billingMonth)")
    List<MeterReading> searchReadings(
            @org.springframework.data.repository.query.Param("rentalId") Long rentalId,
            @org.springframework.data.repository.query.Param("roomId") Long roomId,
            @org.springframework.data.repository.query.Param("billingMonth") String billingMonth);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM MeterReading m WHERE " +
            "(m.rental.id IN :rentalIds) AND " +
            "(:rentalId IS NULL OR m.rental.id = :rentalId) AND " +
            "(:roomId IS NULL OR m.room.id = :roomId) AND " +
            "(:billingMonth IS NULL OR m.billingMonth = :billingMonth)")
    List<MeterReading> searchReadingsForTenant(
            @org.springframework.data.repository.query.Param("rentalIds") List<Long> rentalIds,
            @org.springframework.data.repository.query.Param("rentalId") Long rentalId,
            @org.springframework.data.repository.query.Param("roomId") Long roomId,
            @org.springframework.data.repository.query.Param("billingMonth") String billingMonth);
}
