package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.rental.RoomRentalCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RoomRentalTerminateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RoomRentalUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.RoomRentalResponse;
import com.thachbao.room_rental_management.enums.RentalStatus;
import com.thachbao.room_rental_management.service.RoomRentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-rentals")
@RequiredArgsConstructor
public class RoomRentalController {
    private final RoomRentalService roomRentalService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<RoomRentalResponse> getAllRoomRentals(
            @RequestParam(required = false) RentalStatus status
    ) {
        return roomRentalService.getAllRoomRentals(status);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public RoomRentalResponse getRoomRentalById(@PathVariable Long id) {
        return roomRentalService.getRoomRentalById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RoomRentalResponse createRoomRental(
            @Valid @RequestBody RoomRentalCreateRequest request
    ) {
        return roomRentalService.createRoomRental(request);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RoomRentalResponse updateRoomRental(
            @PathVariable Long id,
            @Valid @RequestBody RoomRentalUpdateRequest request
    ) {
        return roomRentalService.updateRoomRental(id, request);
    }

    @PutMapping("/{id}/terminate")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RoomRentalResponse terminateRoomRental(
            @PathVariable Long id,
            @Valid @RequestBody RoomRentalTerminateRequest request
    ) {
        return roomRentalService.terminateRoomRental(id, request);
    }
}
