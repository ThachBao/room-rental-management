package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.utility.RentalUtilityRateCreateRequest;
import com.thachbao.room_rental_management.dto.request.utility.RentalUtilityRateUpdateRequest;
import com.thachbao.room_rental_management.dto.response.utility.RentalUtilityRateResponse;
import com.thachbao.room_rental_management.entity.RentalUtilityRate;

import java.util.List;

public interface RentalUtilityRateService {
    List<RentalUtilityRateResponse> getRentalUtilityRates(Long rentalId);
    RentalUtilityRateResponse getRentalUtilityRateById(Long id);
    RentalUtilityRateResponse createRentalUtilityRate(RentalUtilityRateCreateRequest request);
    RentalUtilityRateResponse updateRentalUtilityRate(Long id, RentalUtilityRateUpdateRequest request);
    RentalUtilityRate getAppliedUtilityRate(Long rentalId, String billingMonth);
}
