package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.room.RoomCreateRequest;
import com.thachbao.room_rental_management.dto.request.room.RoomUpdateRequest;
import com.thachbao.room_rental_management.dto.response.room.RoomResponse;
import com.thachbao.room_rental_management.entity.Room;
import com.thachbao.room_rental_management.enums.RoomStatus;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.RoomMapper;
import com.thachbao.room_rental_management.repository.RoomRepository;
import com.thachbao.room_rental_management.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;
    private final com.thachbao.room_rental_management.repository.TenantRepository tenantRepository;
    private final com.thachbao.room_rental_management.repository.RentalMemberRepository rentalMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms(){
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElse(null);
            if (tenant == null) {
                return List.of();
            }
            return rentalMemberRepository.findByTenant_Id(tenant.getId()).stream()
                    .filter(m -> m.getRental().getStatus() == com.thachbao.room_rental_management.enums.RentalStatus.ACTIVE)
                    .map(m -> m.getRental().getRoom())
                    .distinct()
                    .map(roomMapper::toResponse)
                    .toList();
        }
        return roomRepository.findAll()
                .stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByStatus(RoomStatus status) {
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            return getAllRooms().stream()
                    .filter(r -> r.getStatus() == status)
                    .toList();
        }
        return roomRepository.findByStatus(status)
                .stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        Room room = findRoomById(id);
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.findByTenant_Id(tenant.getId()).stream()
                    .anyMatch(m -> m.getRental().getRoom().getId().equals(id) && m.getRental().getStatus() == com.thachbao.room_rental_management.enums.RentalStatus.ACTIVE);
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập thông tin phòng này");
            }
        }
        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse createRoom(RoomCreateRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new BadRequestException("Mã phòng đã tồn tại: " + request.getRoomNumber());
        }

        Room room = roomMapper.toEntity(request);
        Room savedRoom = roomRepository.save(room);

        return roomMapper.toResponse(savedRoom);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long id, RoomUpdateRequest request) {
        Room room = findRoomById(id);

        if (roomRepository.existsByRoomNumberAndIdNot(request.getRoomNumber(), id)) {
            throw new BadRequestException("Mã phòng đã tồn tại: " + request.getRoomNumber());
        }

        roomMapper.updateEntity(room, request);
        Room updatedRoom = roomRepository.save(room);

        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public void inactiveRoom(Long id) {
        Room room = findRoomById(id);

        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new BadRequestException("Không thể ngưng sử dụng phòng đang có người ở");
        }

        room.setStatus(RoomStatus.INACTIVE);
        roomRepository.save(room);
    }

    private Room findRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng có id = " + id));
    }
}
