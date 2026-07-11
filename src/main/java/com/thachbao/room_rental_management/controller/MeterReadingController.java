package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.meter.MeterReadingCreateRequest;
import com.thachbao.room_rental_management.dto.request.meter.MeterReadingUpdateRequest;
import com.thachbao.room_rental_management.dto.response.meter.MeterReadingResponse;
import com.thachbao.room_rental_management.service.MeterReadingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meter-readings")
@RequiredArgsConstructor
public class MeterReadingController {
    private final MeterReadingService meterReadingService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<MeterReadingResponse> getMeterReadings(
            @RequestParam(required = false) Long rentalId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) String billingMonth
    ) {
        return meterReadingService.getMeterReadings(rentalId, roomId, billingMonth);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public MeterReadingResponse getMeterReadingById(@PathVariable Long id) {
        return meterReadingService.getMeterReadingById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public MeterReadingResponse createMeterReading(
            @Valid @RequestBody MeterReadingCreateRequest request
    ) {
        return meterReadingService.createMeterReading(request);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public MeterReadingResponse updateMeterReading(
            @PathVariable Long id,
            @Valid @RequestBody MeterReadingUpdateRequest request
    ) {
        return meterReadingService.updateMeterReading(id, request);
    }
}
