package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.rental.ContractFileCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.ContractFileUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.ContractFileResponse;

import java.util.List;

public interface ContractFileService {
    List<ContractFileResponse> getContractFiles(Long rentalId);
    ContractFileResponse getContractFileById(Long id);
    ContractFileResponse createContractFile(ContractFileCreateRequest request);
    ContractFileResponse updateContractFile(Long id, ContractFileUpdateRequest request);
    void deleteContractFile(Long id);
}
