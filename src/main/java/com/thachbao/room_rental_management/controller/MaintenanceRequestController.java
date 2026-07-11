package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceCreateRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceResolveRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceUpdateRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceUpdateStatusRequest;
import com.thachbao.room_rental_management.dto.response.maintenance.MaintenanceRequestResponse;
import com.thachbao.room_rental_management.enums.MaintenancePriority;
import com.thachbao.room_rental_management.enums.MaintenanceStatus;
import com.thachbao.room_rental_management.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-requests")
@RequiredArgsConstructor
public class MaintenanceRequestController {
    private final MaintenanceRequestService maintenanceRequestService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<MaintenanceRequestResponse> getMaintenanceRequests(
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) MaintenancePriority priority,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long rentalId,
            @RequestParam(required = false) Long tenantId
    ) {
        return maintenanceRequestService.getMaintenanceRequests(status, priority, roomId, rentalId, tenantId);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public MaintenanceRequestResponse getMaintenanceRequestById(@PathVariable Long id) {
        return maintenanceRequestService.getMaintenanceRequestById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public MaintenanceRequestResponse createMaintenanceRequest(
            @Valid @RequestBody MaintenanceCreateRequest request
    ) {
        return maintenanceRequestService.createMaintenanceRequest(request);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public MaintenanceRequestResponse updateMaintenanceRequest(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceUpdateRequest request
    ) {
        return maintenanceRequestService.updateMaintenanceRequest(id, request);
    }

    @PutMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public MaintenanceRequestResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceUpdateStatusRequest request
    ) {
        return maintenanceRequestService.updateStatus(id, request);
    }

    @PutMapping("/{id}/resolve")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public MaintenanceRequestResponse resolveMaintenanceRequest(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceResolveRequest request
    ) {
        return maintenanceRequestService.resolveMaintenanceRequest(id, request);
    }
}
