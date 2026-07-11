package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceCreateRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceResolveRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceUpdateRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceUpdateStatusRequest;
import com.thachbao.room_rental_management.dto.response.maintenance.MaintenanceRequestResponse;
import com.thachbao.room_rental_management.entity.MaintenanceRequest;
import com.thachbao.room_rental_management.entity.Room;
import com.thachbao.room_rental_management.entity.RoomRental;
import com.thachbao.room_rental_management.entity.Tenant;
import com.thachbao.room_rental_management.enums.MaintenancePriority;
import com.thachbao.room_rental_management.enums.MaintenanceStatus;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.MaintenanceRequestMapper;
import com.thachbao.room_rental_management.repository.MaintenanceRequestRepository;
import com.thachbao.room_rental_management.repository.RoomRentalRepository;
import com.thachbao.room_rental_management.repository.RoomRepository;
import com.thachbao.room_rental_management.repository.TenantRepository;
import com.thachbao.room_rental_management.service.MaintenanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceRequestServiceImpl implements MaintenanceRequestService {
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final RoomRepository roomRepository;
    private final RoomRentalRepository roomRentalRepository;
    private final TenantRepository tenantRepository;
    private final MaintenanceRequestMapper maintenanceRequestMapper;
    private final com.thachbao.room_rental_management.repository.RentalMemberRepository rentalMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceRequestResponse> getMaintenanceRequests(MaintenanceStatus status, MaintenancePriority priority,
                                                                   Long roomId, Long rentalId, Long tenantId) {
        List<MaintenanceRequest> requests;
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElse(null);
            if (tenant == null) {
                return List.of();
            }
            List<com.thachbao.room_rental_management.entity.RentalMember> memberships = rentalMemberRepository.findByTenant_Id(tenant.getId());
            List<Long> rentalIds = memberships.stream()
                    .map(m -> m.getRental().getId())
                    .collect(Collectors.toList());

            if (rentalIds.isEmpty()) {
                return List.of();
            }

            if (rentalId != null) {
                if (!rentalIds.contains(rentalId)) {
                    throw new BadRequestException("Bạn không có quyền xem yêu cầu báo hỏng của lượt thuê này");
                }
                requests = maintenanceRequestRepository.searchRequestsForTenant(List.of(rentalId), status, priority, roomId, tenantId);
            } else {
                requests = maintenanceRequestRepository.searchRequestsForTenant(rentalIds, status, priority, roomId, tenantId);
            }
        } else {
            requests = maintenanceRequestRepository.searchRequests(status, priority, roomId, rentalId, tenantId);
        }

        return requests.stream()
                .map(maintenanceRequestMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MaintenanceRequestResponse getMaintenanceRequestById(Long id) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu báo hỏng có id = " + id));
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(request.getRental().getId(), tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập yêu cầu báo hỏng này");
            }
        }
        return maintenanceRequestMapper.toResponse(request);
    }

    @Override
    @Transactional
    public MaintenanceRequestResponse createMaintenanceRequest(MaintenanceCreateRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng có id = " + request.getRoomId()));

        RoomRental rental = roomRentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt thuê phòng có id = " + request.getRentalId()));

        if (rental.getRoom() == null || !rental.getRoom().getId().equals(request.getRoomId())) {
            throw new BadRequestException("Phòng báo hỏng không khớp với phòng thuộc lượt thuê");
        }

        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách thuê có id = " + request.getTenantId()));

        MaintenanceRequest maintenanceRequest = maintenanceRequestMapper.toEntity(request);
        maintenanceRequest.setRoom(room);
        maintenanceRequest.setRental(rental);
        maintenanceRequest.setTenant(tenant);
        maintenanceRequest.setStatus(MaintenanceStatus.PENDING);

        MaintenanceRequest savedRequest = maintenanceRequestRepository.save(maintenanceRequest);
        return maintenanceRequestMapper.toResponse(savedRequest);
    }

    @Override
    @Transactional
    public MaintenanceRequestResponse updateMaintenanceRequest(Long id, MaintenanceUpdateRequest request) {
        MaintenanceRequest maintenanceRequest = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu báo hỏng có id = " + id));

        maintenanceRequestMapper.updateEntity(maintenanceRequest, request);
        MaintenanceRequest updated = maintenanceRequestRepository.save(maintenanceRequest);
        return maintenanceRequestMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public MaintenanceRequestResponse updateStatus(Long id, MaintenanceUpdateStatusRequest request) {
        MaintenanceRequest maintenanceRequest = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu báo hỏng có id = " + id));

        if (request.getRepairCost() != null && request.getRepairCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Chi phí sửa chữa không được âm");
        }

        maintenanceRequest.setStatus(request.getStatus());
        if (request.getResolvedNote() != null) {
            maintenanceRequest.setResolvedNote(request.getResolvedNote());
        }
        if (request.getRepairCost() != null) {
            maintenanceRequest.setRepairCost(request.getRepairCost());
        }

        if (request.getStatus() == MaintenanceStatus.DONE) {
            maintenanceRequest.setResolvedAt(LocalDateTime.now());
        }

        MaintenanceRequest updated = maintenanceRequestRepository.save(maintenanceRequest);
        return maintenanceRequestMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public MaintenanceRequestResponse resolveMaintenanceRequest(Long id, MaintenanceResolveRequest request) {
        MaintenanceRequest maintenanceRequest = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu báo hỏng có id = " + id));

        if (request.getRepairCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Chi phí sửa chữa không được âm");
        }

        maintenanceRequest.setStatus(MaintenanceStatus.DONE);
        maintenanceRequest.setResolvedNote(request.getResolvedNote());
        maintenanceRequest.setRepairCost(request.getRepairCost());
        maintenanceRequest.setResolvedAt(request.getResolvedAt() != null ? request.getResolvedAt() : LocalDateTime.now());

        MaintenanceRequest updated = maintenanceRequestRepository.save(maintenanceRequest);
        return maintenanceRequestMapper.toResponse(updated);
    }
}
