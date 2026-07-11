package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.ContractFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContractFileRepository extends JpaRepository<ContractFile, Long> {
    List<ContractFile> findByRental_Id(Long rentalId);
    List<ContractFile> findByRental_IdIn(List<Long> rentalIds);
}
