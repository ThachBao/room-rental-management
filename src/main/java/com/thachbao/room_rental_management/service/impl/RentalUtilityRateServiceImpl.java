package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.utility.RentalUtilityRateCreateRequest;
import com.thachbao.room_rental_management.dto.request.utility.RentalUtilityRateUpdateRequest;
import com.thachbao.room_rental_management.dto.response.utility.RentalUtilityRateResponse;
import com.thachbao.room_rental_management.entity.RentalUtilityRate;
import com.thachbao.room_rental_management.entity.RoomRental;
import com.thachbao.room_rental_management.entity.User;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.RentalUtilityRateMapper;
import com.thachbao.room_rental_management.repository.RentalUtilityRateRepository;
import com.thachbao.room_rental_management.repository.RoomRentalRepository;
import com.thachbao.room_rental_management.repository.UserRepository;
import com.thachbao.room_rental_management.service.RentalUtilityRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalUtilityRateServiceImpl implements RentalUtilityRateService {
    private final RentalUtilityRateRepository rentalUtilityRateRepository;
    private final RoomRentalRepository roomRentalRepository;
    private final UserRepository userRepository;
    private final RentalUtilityRateMapper rentalUtilityRateMapper;
    private final com.thachbao.room_rental_management.repository.TenantRepository tenantRepository;
    private final com.thachbao.room_rental_management.repository.RentalMemberRepository rentalMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RentalUtilityRateResponse> getRentalUtilityRates(Long rentalId) {
        List<RentalUtilityRate> rates;
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
                    throw new BadRequestException("Bạn không có quyền truy cập đơn giá tiện ích của lượt thuê này");
                }
                rates = rentalUtilityRateRepository.findByRental_Id(rentalId);
            } else {
                rates = new java.util.ArrayList<>();
                for (Long rId : rentalIds) {
                    rates.addAll(rentalUtilityRateRepository.findByRental_Id(rId));
                }
            }
        } else {
            if (rentalId != null) {
                rates = rentalUtilityRateRepository.findByRental_Id(rentalId);
            } else {
                rates = rentalUtilityRateRepository.findAll();
            }
        }
        return rates.stream()
                .map(rentalUtilityRateMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RentalUtilityRateResponse getRentalUtilityRateById(Long id) {
        RentalUtilityRate rate = rentalUtilityRateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn giá tiện ích có id = " + id));
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(rate.getRental().getId(), tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập đơn giá tiện ích này");
            }
        }
        return rentalUtilityRateMapper.toResponse(rate);
    }

    @Override
    @Transactional
    public RentalUtilityRateResponse createRentalUtilityRate(RentalUtilityRateCreateRequest request) {
        RoomRental rental = roomRentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt thuê phòng có id = " + request.getRentalId()));

        User user = userRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng có id = " + request.getCreatedByUserId()));

        validatePrices(request.getElectricUnitPrice(), request.getWaterUnitPrice(),
                request.getInternetFee(), request.getTrashFee(), request.getParkingFee());

        if (request.getEffectiveToMonth() != null && request.getEffectiveToMonth().compareTo(request.getEffectiveFromMonth()) < 0) {
            throw new BadRequestException("Tháng kết thúc hiệu lực không được nhỏ hơn tháng bắt đầu");
        }

        if (rentalUtilityRateRepository.existsByRental_IdAndEffectiveFromMonth(request.getRentalId(), request.getEffectiveFromMonth())) {
            throw new BadRequestException("Đã tồn tại cấu hình đơn giá cho lượt thuê này áp dụng từ tháng " + request.getEffectiveFromMonth());
        }

        RentalUtilityRate rate = rentalUtilityRateMapper.toEntity(request);
        rate.setRental(rental);
        rate.setCreatedByUser(user);

        RentalUtilityRate savedRate = rentalUtilityRateRepository.save(rate);
        return rentalUtilityRateMapper.toResponse(savedRate);
    }

    @Override
    @Transactional
    public RentalUtilityRateResponse updateRentalUtilityRate(Long id, RentalUtilityRateUpdateRequest request) {
        RentalUtilityRate rate = rentalUtilityRateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn giá tiện ích có id = " + id));

        validatePrices(request.getElectricUnitPrice(), request.getWaterUnitPrice(),
                request.getInternetFee(), request.getTrashFee(), request.getParkingFee());

        if (request.getEffectiveToMonth() != null && request.getEffectiveToMonth().compareTo(rate.getEffectiveFromMonth()) < 0) {
            throw new BadRequestException("Tháng kết thúc hiệu lực không được nhỏ hơn tháng bắt đầu");
        }

        rentalUtilityRateMapper.updateEntity(rate, request);
        RentalUtilityRate updatedRate = rentalUtilityRateRepository.save(rate);
        return rentalUtilityRateMapper.toResponse(updatedRate);
    }

    @Override
    @Transactional(readOnly = true)
    public RentalUtilityRate getAppliedUtilityRate(Long rentalId, String billingMonth) {
        List<RentalUtilityRate> rates = rentalUtilityRateRepository.findByRental_IdAndEffectiveFromMonthLessThanEqual(rentalId, billingMonth);
        return rates.stream()
                .filter(r -> r.getEffectiveToMonth() == null || r.getEffectiveToMonth().compareTo(billingMonth) >= 0)
                .sorted((r1, r2) -> r2.getEffectiveFromMonth().compareTo(r1.getEffectiveFromMonth()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn giá tiện ích áp dụng cho tháng " + billingMonth));
    }

    private void validatePrices(BigDecimal electric, BigDecimal water, BigDecimal internet, BigDecimal trash, BigDecimal parking) {
        if (electric.compareTo(BigDecimal.ZERO) < 0 ||
            water.compareTo(BigDecimal.ZERO) < 0 ||
            internet.compareTo(BigDecimal.ZERO) < 0 ||
            trash.compareTo(BigDecimal.ZERO) < 0 ||
            parking.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Các khoản đơn giá tiện ích và chi phí không được âm");
        }
    }
}
