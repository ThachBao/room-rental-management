package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.RentalMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalMemberRepository extends JpaRepository<RentalMember, Long> {
    List<RentalMember> findByRental_Id(Long rentalId);
    List<RentalMember> findByTenant_Id(Long tenantId);
    boolean existsByRental_IdAndTenant_Id(Long rentalId, Long tenantId);
}
