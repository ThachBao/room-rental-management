package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.rental.ContractFileCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.ContractFileUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.ContractFileResponse;
import com.thachbao.room_rental_management.entity.ContractFile;
import org.springframework.stereotype.Component;

@Component
public class ContractFileMapper {

    public ContractFileResponse toResponse(ContractFile entity) {
        if (entity == null) {
            return null;
        }
        return ContractFileResponse.builder()
                .id(entity.getId())
                .rentalId(entity.getRental() != null ? entity.getRental().getId() : null)
                .fileName(entity.getFileName())
                .fileUrl(entity.getFileUrl())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .uploadedByUserId(entity.getUploadedByUser() != null ? entity.getUploadedByUser().getId() : null)
                .uploadedByUserName(entity.getUploadedByUser() != null ? entity.getUploadedByUser().getFullName() : null)
                .uploadedAt(entity.getUploadedAt())
                .note(entity.getNote())
                .build();
    }

    public ContractFile toEntity(ContractFileCreateRequest request) {
        if (request == null) {
            return null;
        }
        return ContractFile.builder()
                .fileName(request.getFileName())
                .fileUrl(request.getFileUrl())
                .fileType(request.getFileType())
                .fileSize(request.getFileSize())
                .note(blankToNull(request.getNote()))
                .build();
    }

    public void updateEntity(ContractFile entity, ContractFileUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setFileName(request.getFileName());
        entity.setFileUrl(request.getFileUrl());
        entity.setFileType(request.getFileType());
        entity.setFileSize(request.getFileSize());
        entity.setNote(blankToNull(request.getNote()));
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
