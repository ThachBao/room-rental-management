package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.utility.RentalUtilityRateCreateRequest;
import com.thachbao.room_rental_management.dto.request.utility.RentalUtilityRateUpdateRequest;
import com.thachbao.room_rental_management.dto.response.utility.RentalUtilityRateResponse;
import com.thachbao.room_rental_management.service.RentalUtilityRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rental-utility-rates")
@RequiredArgsConstructor
public class RentalUtilityRateController {
    private final RentalUtilityRateService rentalUtilityRateService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<RentalUtilityRateResponse> getRentalUtilityRates(
            @RequestParam(required = false) Long rentalId
    ) {
        return rentalUtilityRateService.getRentalUtilityRates(rentalId);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public RentalUtilityRateResponse getRentalUtilityRateById(@PathVariable Long id) {
        return rentalUtilityRateService.getRentalUtilityRateById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RentalUtilityRateResponse createRentalUtilityRate(
            @Valid @RequestBody RentalUtilityRateCreateRequest request
    ) {
        return rentalUtilityRateService.createRentalUtilityRate(request);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RentalUtilityRateResponse updateRentalUtilityRate(
            @PathVariable Long id,
            @Valid @RequestBody RentalUtilityRateUpdateRequest request
    ) {
        return rentalUtilityRateService.updateRentalUtilityRate(id, request);
    }
}
