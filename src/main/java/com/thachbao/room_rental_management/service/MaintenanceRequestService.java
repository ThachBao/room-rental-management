package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceCreateRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceResolveRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceUpdateRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceUpdateStatusRequest;
import com.thachbao.room_rental_management.dto.response.maintenance.MaintenanceRequestResponse;
import com.thachbao.room_rental_management.enums.MaintenancePriority;
import com.thachbao.room_rental_management.enums.MaintenanceStatus;

import java.util.List;

public interface MaintenanceRequestService {
    List<MaintenanceRequestResponse> getMaintenanceRequests(MaintenanceStatus status, MaintenancePriority priority,
                                                           Long roomId, Long rentalId, Long tenantId);
    MaintenanceRequestResponse getMaintenanceRequestById(Long id);
    MaintenanceRequestResponse createMaintenanceRequest(MaintenanceCreateRequest request);
    MaintenanceRequestResponse updateMaintenanceRequest(Long id, MaintenanceUpdateRequest request);
    MaintenanceRequestResponse updateStatus(Long id, MaintenanceUpdateStatusRequest request);
    MaintenanceRequestResponse resolveMaintenanceRequest(Long id, MaintenanceResolveRequest request);
}
