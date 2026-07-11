package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.RentalUtilityRate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalUtilityRateRepository extends JpaRepository<RentalUtilityRate, Long> {
    List<RentalUtilityRate> findByRental_Id(Long rentalId);
    boolean existsByRental_IdAndEffectiveFromMonth(Long rentalId, String effectiveFromMonth);
    List<RentalUtilityRate> findByRental_IdAndEffectiveFromMonthLessThanEqual(Long rentalId, String billingMonth);
}
