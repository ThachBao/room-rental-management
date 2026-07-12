package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.meter.MeterReadingCreateRequest;
import com.thachbao.room_rental_management.dto.request.meter.MeterReadingUpdateRequest;
import com.thachbao.room_rental_management.dto.response.meter.MeterReadingResponse;
import com.thachbao.room_rental_management.entity.MeterReading;
import com.thachbao.room_rental_management.entity.Room;
import com.thachbao.room_rental_management.entity.RoomRental;
import com.thachbao.room_rental_management.enums.RentalStatus;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.MeterReadingMapper;
import com.thachbao.room_rental_management.repository.MeterReadingRepository;
import com.thachbao.room_rental_management.repository.RoomRentalRepository;
import com.thachbao.room_rental_management.service.MeterReadingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeterReadingServiceImpl implements MeterReadingService {
    private final MeterReadingRepository meterReadingRepository;
    private final RoomRentalRepository roomRentalRepository;
    private final MeterReadingMapper meterReadingMapper;
    private final com.thachbao.room_rental_management.repository.TenantRepository tenantRepository;
    private final com.thachbao.room_rental_management.repository.RentalMemberRepository rentalMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MeterReadingResponse> getMeterReadings(Long rentalId, Long roomId, String billingMonth) {
        List<MeterReading> readings;
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
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
                    throw new BadRequestException("Bạn không có quyền truy cập chỉ số điện nước của lượt thuê này");
                }
                readings = meterReadingRepository.searchReadingsForTenant(List.of(rentalId), rentalId, roomId, billingMonth);
            } else {
                readings = meterReadingRepository.searchReadingsForTenant(rentalIds, rentalId, roomId, billingMonth);
            }
        } else {
            readings = meterReadingRepository.searchReadings(rentalId, roomId, billingMonth);
        }
        return readings.stream()
                .map(meterReadingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MeterReadingResponse getMeterReadingById(Long id) {
        MeterReading reading = meterReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số điện nước có id = " + id));
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(reading.getRental().getId(), tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập chỉ số điện nước này");
            }
        }
        return meterReadingMapper.toResponse(reading);
    }

    @Override
    @Transactional
    public MeterReadingResponse createMeterReading(MeterReadingCreateRequest request) {
        RoomRental rental = roomRentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt thuê phòng có id = " + request.getRentalId()));

        if (rental.getStatus() != RentalStatus.ACTIVE && rental.getStatus() != RentalStatus.EXPIRED) {
            throw new BadRequestException("Lượt thuê phòng phải ở trạng thái ACTIVE hoặc EXPIRED mới được tạo chỉ số");
        }

        Room room = rental.getRoom();
        if (room == null) {
            throw new BadRequestException("Lượt thuê không liên kết với phòng hợp lệ");
        }

        if (meterReadingRepository.existsByRental_IdAndBillingMonth(request.getRentalId(), request.getBillingMonth())) {
            throw new BadRequestException("Đã tồn tại chỉ số điện nước của lượt thuê này trong tháng " + request.getBillingMonth());
        }

        validateNumbers(request.getOldElectricNumber(), request.getNewElectricNumber(),
                request.getOldWaterNumber(), request.getNewWaterNumber());

        MeterReading reading = meterReadingMapper.toEntity(request);
        reading.setRental(rental);
        reading.setRoom(room);

        MeterReading savedReading = meterReadingRepository.save(reading);
        return meterReadingMapper.toResponse(savedReading);
    }

    @Override
    @Transactional
    public MeterReadingResponse updateMeterReading(Long id, MeterReadingUpdateRequest request) {
        MeterReading reading = meterReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số điện nước có id = " + id));

        validateNumbers(request.getOldElectricNumber(), request.getNewElectricNumber(),
                request.getOldWaterNumber(), request.getNewWaterNumber());

        meterReadingMapper.updateEntity(reading, request);
        MeterReading updatedReading = meterReadingRepository.save(reading);
        return meterReadingMapper.toResponse(updatedReading);
    }

    private void validateNumbers(Integer oldElectric, Integer newElectric, Integer oldWater, Integer newWater) {
        if (oldElectric < 0 || newElectric < oldElectric) {
            throw new BadRequestException("Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ");
        }
        if (oldWater < 0 || newWater < oldWater) {
            throw new BadRequestException("Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ");
        }
    }
}
