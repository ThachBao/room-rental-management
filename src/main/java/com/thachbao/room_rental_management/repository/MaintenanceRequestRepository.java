package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.MaintenanceRequest;
import com.thachbao.room_rental_management.enums.MaintenancePriority;
import com.thachbao.room_rental_management.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);
    List<MaintenanceRequest> findByPriority(MaintenancePriority priority);
    List<MaintenanceRequest> findByRoom_Id(Long roomId);
    List<MaintenanceRequest> findByRental_Id(Long rentalId);
    List<MaintenanceRequest> findByTenant_Id(Long tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM MaintenanceRequest r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:priority IS NULL OR r.priority = :priority) AND " +
            "(:roomId IS NULL OR r.room.id = :roomId) AND " +
            "(:rentalId IS NULL OR r.rental.id = :rentalId) AND " +
            "(:tenantId IS NULL OR r.tenant.id = :tenantId)")
    List<MaintenanceRequest> searchRequests(
            @org.springframework.data.repository.query.Param("status") MaintenanceStatus status,
            @org.springframework.data.repository.query.Param("priority") MaintenancePriority priority,
            @org.springframework.data.repository.query.Param("roomId") Long roomId,
            @org.springframework.data.repository.query.Param("rentalId") Long rentalId,
            @org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM MaintenanceRequest r WHERE " +
            "(r.rental.id IN :rentalIds) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:priority IS NULL OR r.priority = :priority) AND " +
            "(:roomId IS NULL OR r.room.id = :roomId) AND " +
            "(:tenantId IS NULL OR r.tenant.id = :tenantId)")
    List<MaintenanceRequest> searchRequestsForTenant(
            @org.springframework.data.repository.query.Param("rentalIds") List<Long> rentalIds,
            @org.springframework.data.repository.query.Param("status") MaintenanceStatus status,
            @org.springframework.data.repository.query.Param("priority") MaintenancePriority priority,
            @org.springframework.data.repository.query.Param("roomId") Long roomId,
            @org.springframework.data.repository.query.Param("tenantId") Long tenantId);
}
