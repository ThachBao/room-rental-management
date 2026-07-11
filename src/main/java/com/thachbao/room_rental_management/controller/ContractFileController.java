package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.rental.ContractFileCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.ContractFileUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.ContractFileResponse;
import com.thachbao.room_rental_management.service.ContractFileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contract-files")
@RequiredArgsConstructor
public class ContractFileController {
    private final ContractFileService contractFileService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<ContractFileResponse> getContractFiles(
            @RequestParam(required = false) Long rentalId
    ) {
        return contractFileService.getContractFiles(rentalId);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public ContractFileResponse getContractFileById(@PathVariable Long id) {
        return contractFileService.getContractFileById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public ContractFileResponse createContractFile(
            @Valid @RequestBody ContractFileCreateRequest request
    ) {
        return contractFileService.createContractFile(request);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public ContractFileResponse updateContractFile(
            @PathVariable Long id,
            @Valid @RequestBody ContractFileUpdateRequest request
    ) {
        return contractFileService.updateContractFile(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public void deleteContractFile(@PathVariable Long id) {
        contractFileService.deleteContractFile(id);
    }
}
