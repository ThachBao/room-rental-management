package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.meter.MeterReadingCreateRequest;
import com.thachbao.room_rental_management.dto.request.meter.MeterReadingUpdateRequest;
import com.thachbao.room_rental_management.dto.response.meter.MeterReadingResponse;

import java.util.List;

public interface MeterReadingService {
    List<MeterReadingResponse> getMeterReadings(Long rentalId, Long roomId, String billingMonth);
    MeterReadingResponse getMeterReadingById(Long id);
    MeterReadingResponse createMeterReading(MeterReadingCreateRequest request);
    MeterReadingResponse updateMeterReading(Long id, MeterReadingUpdateRequest request);
}
