package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.rental.RoomRentalCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RoomRentalTerminateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RoomRentalUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.RoomRentalResponse;
import com.thachbao.room_rental_management.entity.Room;
import com.thachbao.room_rental_management.entity.RoomRental;
import com.thachbao.room_rental_management.entity.Tenant;
import com.thachbao.room_rental_management.entity.User;
import com.thachbao.room_rental_management.enums.DepositStatus;
import com.thachbao.room_rental_management.enums.RentalStatus;
import com.thachbao.room_rental_management.enums.RoomStatus;
import com.thachbao.room_rental_management.enums.UserRole;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.RoomRentalMapper;
import com.thachbao.room_rental_management.repository.RoomRentalRepository;
import com.thachbao.room_rental_management.repository.RoomRepository;
import com.thachbao.room_rental_management.repository.TenantRepository;
import com.thachbao.room_rental_management.repository.UserRepository;
import com.thachbao.room_rental_management.service.RoomRentalService;
import com.thachbao.room_rental_management.entity.RentalMember;
import com.thachbao.room_rental_management.enums.RentalMemberRole;
import com.thachbao.room_rental_management.repository.RentalMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomRentalServiceImpl implements RoomRentalService {
    private final RoomRentalRepository roomRentalRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final RoomRentalMapper roomRentalMapper;
    private final RentalMemberRepository rentalMemberRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public List<RoomRentalResponse> getAllRoomRentals(RentalStatus status) {
        autoUpdateExpiredRentals();
        List<RoomRental> roomRentals;

        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElse(null);
            if (tenant == null) {
                return List.of();
            }
            List<RentalMember> memberships = rentalMemberRepository.findByTenant_Id(tenant.getId());
            roomRentals = memberships.stream()
                    .map(RentalMember::getRental)
                    .filter(rental -> status == null || 
                                     (status == RentalStatus.ACTIVE && (rental.getStatus() == RentalStatus.ACTIVE || rental.getStatus() == RentalStatus.EXPIRED)) ||
                                     rental.getStatus() == status)
                    .collect(Collectors.toList());
        } else {
            if (status == null) {
                roomRentals = roomRentalRepository.findAll();
            } else if (status == RentalStatus.ACTIVE) {
                roomRentals = roomRentalRepository.findByStatusIn(List.of(RentalStatus.ACTIVE, RentalStatus.EXPIRED));
            } else {
                roomRentals = roomRentalRepository.findByStatus(status);
            }
        }

        return roomRentals.stream()
                .map(roomRentalMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomRentalResponse getRoomRentalById(Long id) {
        autoUpdateExpiredRentals();
        RoomRental roomRental = findRoomRentalById(id);
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(id, tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập thông tin lượt thuê này");
            }
        }
        return roomRentalMapper.toResponse(roomRental);
    }

    @Override
    @Transactional
    public RoomRentalResponse createRoomRental(RoomRentalCreateRequest request) {
        validateRentalDate(request.getStartDate(), request.getExpectedEndDate());
        validateDepositPayment(request.getDepositAmount(), request.getDepositPaidAmount());

        Room room = findRoomById(request.getRoomId());
        validateRoomCanBeRented(room);

        Tenant representativeTenant = findTenantById(request.getRepresentativeTenantId());

        // Kiểm tra khách đại diện này đã ở phòng khác chưa
        List<RentalMember> activeMemberships = rentalMemberRepository.findByTenant_Id(representativeTenant.getId());
        for (RentalMember m : activeMemberships) {
            if (m.getMoveOutDate() == null) {
                throw new BadRequestException("Khách thuê này hiện đang ở phòng " + m.getRental().getRoom().getRoomNumber() + ". Vui lòng báo chuyển đi trước khi lập hợp đồng mới.");
            }
        }

        // Tự động tạo tài khoản đăng nhập cho người đại diện nếu chưa có
        autoCreateAccountForRepresentative(representativeTenant);

        RoomRental roomRental = roomRentalMapper.toEntity(request);
        roomRental.setRoom(room);
        roomRental.setRepresentativeTenant(representativeTenant);
        roomRental.setStatus(RentalStatus.ACTIVE);
        roomRental.setDepositStatus(DepositStatus.HELD);

        RoomRental savedRoomRental = roomRentalRepository.save(roomRental);

        // Auto create RentalMember for Representative Tenant
        RentalMember representativeMember = RentalMember.builder()
                .rental(savedRoomRental)
                .tenant(representativeTenant)
                .memberRole(RentalMemberRole.REPRESENTATIVE)
                .moveInDate(request.getStartDate())
                .build();
        rentalMemberRepository.save(representativeMember);

        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        return roomRentalMapper.toResponse(savedRoomRental);
    }

    @Override
    @Transactional
    public RoomRentalResponse updateRoomRental(Long id, RoomRentalUpdateRequest request) {
        RoomRental roomRental = findRoomRentalById(id);

        if (roomRental.getStatus() != RentalStatus.ACTIVE && roomRental.getStatus() != RentalStatus.EXPIRED) {
            throw new BadRequestException("Chỉ được cập nhật lượt thuê đang ACTIVE hoặc EXPIRED");
        }

        validateRentalDate(request.getStartDate(), request.getExpectedEndDate());
        validateDepositPayment(request.getDepositAmount(), request.getDepositPaidAmount());

        roomRentalMapper.updateEntity(roomRental, request);

        // Auto update status based on new expectedEndDate
        java.time.LocalDate today = java.time.LocalDate.now();
        if (request.getExpectedEndDate() == null || !request.getExpectedEndDate().isBefore(today)) {
            roomRental.setStatus(RentalStatus.ACTIVE);
        } else {
            roomRental.setStatus(RentalStatus.EXPIRED);
        }

        RoomRental updatedRoomRental = roomRentalRepository.save(roomRental);

        return roomRentalMapper.toResponse(updatedRoomRental);
    }

    @Override
    @Transactional
    public RoomRentalResponse terminateRoomRental(Long id, RoomRentalTerminateRequest request) {
        RoomRental roomRental = findRoomRentalById(id);

        if (roomRental.getStatus() != RentalStatus.ACTIVE && roomRental.getStatus() != RentalStatus.EXPIRED) {
            throw new BadRequestException("Chỉ được kết thúc lượt thuê đang ACTIVE hoặc EXPIRED");
        }

        if (request.getMoveOutDate().isBefore(roomRental.getStartDate())) {
            throw new BadRequestException("Ngày trả phòng không được nhỏ hơn ngày bắt đầu thuê");
        }

        BigDecimal deductionAmount = nullToZero(request.getDepositDeductionAmount());
        BigDecimal returnAmount = nullToZero(request.getDepositReturnAmount());
        BigDecimal totalHandledDeposit = deductionAmount.add(returnAmount);

        if (totalHandledDeposit.compareTo(roomRental.getDepositPaidAmount()) > 0) {
            throw new BadRequestException("Tổng tiền cọc bị trừ và tiền cọc hoàn trả không được lớn hơn tiền cọc đã trả");
        }

        roomRental.setMoveOutDate(request.getMoveOutDate());
        roomRental.setDepositDeductionAmount(deductionAmount);
        roomRental.setDepositReturnAmount(returnAmount);
        roomRental.setDepositReturnedAt(
                request.getDepositReturnedAt() != null
                        ? request.getDepositReturnedAt()
                        : LocalDateTime.now()
        );
        roomRental.setDepositNote(normalizeOptionalText(request.getDepositNote()));
        roomRental.setStatus(RentalStatus.TERMINATED);

        if (deductionAmount.compareTo(BigDecimal.ZERO) > 0) {
            roomRental.setDepositStatus(DepositStatus.DEDUCTED);
        } else {
            roomRental.setDepositStatus(DepositStatus.RETURNED);
        }

        Room room = roomRental.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        // Tự động báo dời đi cho toàn bộ thành viên đang sinh sống tại lượt thuê này
        List<RentalMember> activeMembers = rentalMemberRepository.findByRental_Id(roomRental.getId());
        for (RentalMember member : activeMembers) {
            if (member.getMoveOutDate() == null) {
                member.setMoveOutDate(request.getMoveOutDate());
                if (member.getNote() == null || member.getNote().trim().isEmpty()) {
                    member.setNote("Tự động chuyển ra khi trả phòng/kết thúc hợp đồng.");
                } else {
                    member.setNote(member.getNote() + " (Tự động chuyển ra khi trả phòng)");
                }
                rentalMemberRepository.save(member);
            }
        }

        RoomRental terminatedRoomRental = roomRentalRepository.save(roomRental);

        return roomRentalMapper.toResponse(terminatedRoomRental);
    }

    private void autoUpdateExpiredRentals() {
        List<RoomRental> activeRentals = roomRentalRepository.findByStatus(RentalStatus.ACTIVE);
        java.time.LocalDate today = java.time.LocalDate.now();
        for (RoomRental rental : activeRentals) {
            if (rental.getExpectedEndDate() != null && rental.getExpectedEndDate().isBefore(today)) {
                rental.setStatus(RentalStatus.EXPIRED);
                roomRentalRepository.save(rental);
            }
        }
    }

    private RoomRental findRoomRentalById(Long id) {
        return roomRentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt thuê phòng có id = " + id));
    }

    private Room findRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng có id = " + roomId));
    }

    private Tenant findTenantById(Long tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người thuê có id = " + tenantId));
    }

    private void validateRoomCanBeRented(Room room) {
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BadRequestException("Phòng hiện không ở trạng thái AVAILABLE nên không thể cho thuê");
        }

        if (roomRentalRepository.existsByRoom_IdAndStatusIn(room.getId(), List.of(RentalStatus.ACTIVE, RentalStatus.EXPIRED))) {
            throw new BadRequestException("Phòng này đang có lượt thuê hoạt động hoặc hết hạn chưa quyết toán");
        }
    }

    private void validateRentalDate(java.time.LocalDate startDate, java.time.LocalDate expectedEndDate) {
        if (expectedEndDate != null && expectedEndDate.isBefore(startDate)) {
            throw new BadRequestException("Ngày dự kiến kết thúc không được nhỏ hơn ngày bắt đầu thuê");
        }
    }

    private void validateDepositPayment(BigDecimal depositAmount, BigDecimal depositPaidAmount) {
        if (depositPaidAmount.compareTo(depositAmount) > 0) {
            throw new BadRequestException("Tiền cọc đã trả không được lớn hơn tiền cọc yêu cầu");
        }
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    /**
     * Tự động tạo tài khoản đăng nhập (User) cho người đại diện khi lập hợp đồng.
     * - Nếu tenant đã có tài khoản liên kết (user != null) → bỏ qua, không làm gì.
     * - Nếu chưa có tài khoản → kiểm tra SĐT:
     *   + SĐT đã tồn tại và là TENANT → liên kết luôn.
     *   + SĐT đã tồn tại nhưng là ADMIN/OWNER → báo lỗi.
     *   + SĐT chưa tồn tại → tạo mới tài khoản mật khẩu mặc định "123456".
     */
    private void autoCreateAccountForRepresentative(Tenant tenant) {
        // Nếu tenant đã có tài khoản liên kết rồi thì bỏ qua
        if (tenant.getUser() != null) {
            return;
        }

        String phone = tenant.getPhone() != null ? tenant.getPhone().trim() : null;
        if (phone == null || phone.isEmpty()) {
            return; // Không có SĐT thì không thể tạo tài khoản
        }

        Optional<User> existingUserOpt = userRepository.findByPhone(phone);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.getUserRole() == UserRole.TENANT) {
                // SĐT đã có tài khoản TENANT, liên kết luôn
                tenant.setUser(existingUser);
                tenantRepository.save(tenant);
            } else {
                throw new BadRequestException("Số điện thoại " + phone + " đã được đăng ký cho tài khoản Chủ trọ/Quản lý. Không thể tự động tạo tài khoản cho người đại diện.");
            }
        } else {
            // Tạo mới tài khoản với mật khẩu mặc định "123456"
            User newUser = User.builder()
                    .fullName(tenant.getFullName().trim())
                    .phone(phone)
                    .passwordHash(passwordEncoder.encode("123456"))
                    .userRole(UserRole.TENANT)
                    .enabled(true)
                    .build();
            newUser = userRepository.save(newUser);
            tenant.setUser(newUser);
            tenantRepository.save(tenant);
        }
    }
}
