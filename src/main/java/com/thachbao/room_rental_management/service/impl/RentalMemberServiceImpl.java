package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.rental.RentalMemberCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RentalMemberMoveOutRequest;
import com.thachbao.room_rental_management.dto.request.rental.RentalMemberUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.RentalMemberResponse;
import com.thachbao.room_rental_management.entity.RentalMember;
import com.thachbao.room_rental_management.entity.RoomRental;
import com.thachbao.room_rental_management.entity.Tenant;
import com.thachbao.room_rental_management.enums.RentalMemberRole;
import com.thachbao.room_rental_management.enums.RentalStatus;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.RentalMemberMapper;
import com.thachbao.room_rental_management.repository.RentalMemberRepository;
import com.thachbao.room_rental_management.repository.RoomRentalRepository;
import com.thachbao.room_rental_management.repository.TenantRepository;
import com.thachbao.room_rental_management.service.RentalMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalMemberServiceImpl implements RentalMemberService {
    private final RentalMemberRepository rentalMemberRepository;
    private final RoomRentalRepository roomRentalRepository;
    private final TenantRepository tenantRepository;
    private final RentalMemberMapper rentalMemberMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RentalMemberResponse> getRentalMembers(Long rentalId, Long tenantId) {
        List<RentalMember> members;
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElse(null);
            if (tenant == null) {
                return List.of();
            }

            if (rentalId != null) {
                boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(rentalId, tenant.getId());
                if (!isMember) {
                    throw new BadRequestException("Bạn không có quyền truy cập thông tin thành viên của lượt thuê này");
                }
                members = rentalMemberRepository.findByRental_Id(rentalId);
            } else {
                List<RentalMember> memberships = rentalMemberRepository.findByTenant_Id(tenant.getId());
                List<Long> rentalIds = memberships.stream()
                        .map(m -> m.getRental().getId())
                        .collect(Collectors.toList());

                members = new java.util.ArrayList<>();
                for (Long rId : rentalIds) {
                    members.addAll(rentalMemberRepository.findByRental_Id(rId));
                }
            }
        } else {
            if (rentalId != null && tenantId != null) {
                members = rentalMemberRepository.findByRental_Id(rentalId).stream()
                        .filter(m -> m.getTenant() != null && m.getTenant().getId().equals(tenantId))
                        .collect(Collectors.toList());
            } else if (rentalId != null) {
                members = rentalMemberRepository.findByRental_Id(rentalId);
            } else if (tenantId != null) {
                members = rentalMemberRepository.findByTenant_Id(tenantId);
            } else {
                members = rentalMemberRepository.findAll();
            }
        }
        return members.stream()
                .map(rentalMemberMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RentalMemberResponse getRentalMemberById(Long id) {
        RentalMember member = rentalMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên thuê phòng có id = " + id));
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(member.getRental().getId(), tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập thông tin thành viên này");
            }
        }
        return rentalMemberMapper.toResponse(member);
    }

    @Override
    @Transactional
    public RentalMemberResponse createRentalMember(RentalMemberCreateRequest request) {
        RoomRental rental = roomRentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt thuê phòng có id = " + request.getRentalId()));

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new BadRequestException("Lượt thuê phòng phải ở trạng thái ACTIVE mới được thêm thành viên");
        }

        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách thuê có id = " + request.getTenantId()));

        // Ràng buộc 1: Một khách thuê không được ở 2 phòng cùng lúc (nếu đang có lượt thuê khác hoạt động)
        List<RentalMember> activeRoomMemberships = rentalMemberRepository.findByTenant_Id(tenant.getId());
        for (RentalMember m : activeRoomMemberships) {
            if (m.getMoveOutDate() == null) {
                throw new BadRequestException("Khách thuê này hiện đang ở phòng " + m.getRental().getRoom().getRoomNumber() + ". Vui lòng báo chuyển đi trước khi thêm vào phòng khác.");
            }
        }

        // Ràng buộc 2: Không được phép tạo thủ công thành viên là Người đại diện (Chỉ tạo tự động từ hợp đồng)
        if (request.getMemberRole() == RentalMemberRole.REPRESENTATIVE) {
            throw new BadRequestException("Không thể tạo thành viên với vai trò Người đại diện thủ công. Vai trò này được thiết lập tự động từ hợp đồng.");
        }

        if (rentalMemberRepository.existsByRental_IdAndTenant_Id(request.getRentalId(), request.getTenantId())) {
            throw new BadRequestException("Khách thuê này đã có trong danh sách thành viên của lượt thuê");
        }

        RentalMember member = rentalMemberMapper.toEntity(request);
        member.setRental(rental);
        member.setTenant(tenant);

        RentalMember savedMember = rentalMemberRepository.save(member);
        return rentalMemberMapper.toResponse(savedMember);
    }

    @Override
    @Transactional
    public RentalMemberResponse updateRentalMember(Long id, RentalMemberUpdateRequest request) {
        RentalMember member = rentalMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên thuê phòng có id = " + id));

        if (request.getMoveOutDate() != null && request.getMoveOutDate().isBefore(member.getMoveInDate())) {
            throw new BadRequestException("Ngày dời đi không được nhỏ hơn ngày dọn vào");
        }

        // Ràng buộc 3: Không được phép thay đổi vai trò của thành viên phòng trọ thủ công
        if (request.getMemberRole() != member.getMemberRole()) {
            throw new BadRequestException("Không được phép thay đổi vai trò của thành viên phòng trọ.");
        }

        rentalMemberMapper.updateEntity(member, request);
        RentalMember updatedMember = rentalMemberRepository.save(member);
        return rentalMemberMapper.toResponse(updatedMember);
    }

    @Override
    @Transactional
    public RentalMemberResponse moveOutRentalMember(Long id, RentalMemberMoveOutRequest request) {
        RentalMember member = rentalMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên thuê phòng có id = " + id));

        if (request.getMoveOutDate().isBefore(member.getMoveInDate())) {
            throw new BadRequestException("Ngày dời đi không được nhỏ hơn ngày dọn vào");
        }

        member.setMoveOutDate(request.getMoveOutDate());
        if (request.getNote() != null && !request.getNote().trim().isEmpty()) {
            member.setNote(request.getNote().trim());
        }

        RentalMember updatedMember = rentalMemberRepository.save(member);
        return rentalMemberMapper.toResponse(updatedMember);
    }
}
