package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.rental.ContractFileCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.ContractFileUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.ContractFileResponse;
import com.thachbao.room_rental_management.entity.ContractFile;
import com.thachbao.room_rental_management.entity.RoomRental;
import com.thachbao.room_rental_management.entity.User;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.ContractFileMapper;
import com.thachbao.room_rental_management.repository.ContractFileRepository;
import com.thachbao.room_rental_management.repository.RoomRentalRepository;
import com.thachbao.room_rental_management.repository.UserRepository;
import com.thachbao.room_rental_management.service.ContractFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractFileServiceImpl implements ContractFileService {
    private final ContractFileRepository contractFileRepository;
    private final RoomRentalRepository roomRentalRepository;
    private final UserRepository userRepository;
    private final ContractFileMapper contractFileMapper;
    private final com.thachbao.room_rental_management.repository.TenantRepository tenantRepository;
    private final com.thachbao.room_rental_management.repository.RentalMemberRepository rentalMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ContractFileResponse> getContractFiles(Long rentalId) {
        List<ContractFile> files;
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElse(null);
            if (tenant == null) {
                return List.of();
            }

            if (rentalId != null) {
                boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(rentalId, tenant.getId());
                if (!isMember) {
                    throw new BadRequestException("Bạn không có quyền truy cập hồ sơ hợp đồng của lượt thuê này");
                }
                files = contractFileRepository.findByRental_Id(rentalId);
            } else {
                List<com.thachbao.room_rental_management.entity.RentalMember> memberships = rentalMemberRepository.findByTenant_Id(tenant.getId());
                List<Long> rentalIds = memberships.stream()
                        .map(m -> m.getRental().getId())
                        .collect(Collectors.toList());
                if (!rentalIds.isEmpty()) {
                    files = contractFileRepository.findByRental_IdIn(rentalIds);
                } else {
                    files = new java.util.ArrayList<>();
                }
            }
        } else {
            if (rentalId != null) {
                files = contractFileRepository.findByRental_Id(rentalId);
            } else {
                files = contractFileRepository.findAll();
            }
        }
        return files.stream()
                .map(contractFileMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ContractFileResponse getContractFileById(Long id) {
        ContractFile file = contractFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tệp hợp đồng có id = " + id));
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(file.getRental().getId(), tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập tệp hợp đồng này");
            }
        }
        return contractFileMapper.toResponse(file);
    }

    @Override
    @Transactional
    public ContractFileResponse createContractFile(ContractFileCreateRequest request) {
        RoomRental rental = roomRentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt thuê phòng có id = " + request.getRentalId()));

        User user = userRepository.findById(request.getUploadedByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng tải lên có id = " + request.getUploadedByUserId()));

        if (request.getFileSize() <= 0) {
            throw new BadRequestException("Dung lượng tệp phải lớn hơn 0");
        }

        ContractFile contractFile = contractFileMapper.toEntity(request);
        contractFile.setRental(rental);
        contractFile.setUploadedByUser(user);

        ContractFile savedFile = contractFileRepository.save(contractFile);
        return contractFileMapper.toResponse(savedFile);
    }

    @Override
    @Transactional
    public ContractFileResponse updateContractFile(Long id, ContractFileUpdateRequest request) {
        ContractFile contractFile = contractFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tệp hợp đồng có id = " + id));

        if (request.getFileSize() <= 0) {
            throw new BadRequestException("Dung lượng tệp phải lớn hơn 0");
        }

        contractFileMapper.updateEntity(contractFile, request);
        ContractFile updatedFile = contractFileRepository.save(contractFile);
        return contractFileMapper.toResponse(updatedFile);
    }

    @Override
    @Transactional
    public void deleteContractFile(Long id) {
        ContractFile file = contractFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tệp hợp đồng có id = " + id));
        contractFileRepository.delete(file);
    }
}
