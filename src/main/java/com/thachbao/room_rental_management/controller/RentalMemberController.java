package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.rental.RentalMemberCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RentalMemberMoveOutRequest;
import com.thachbao.room_rental_management.dto.request.rental.RentalMemberUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.RentalMemberResponse;
import com.thachbao.room_rental_management.service.RentalMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rental-members")
@RequiredArgsConstructor
public class RentalMemberController {
    private final RentalMemberService rentalMemberService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<RentalMemberResponse> getRentalMembers(
            @RequestParam(required = false) Long rentalId,
            @RequestParam(required = false) Long tenantId
    ) {
        return rentalMemberService.getRentalMembers(rentalId, tenantId);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public RentalMemberResponse getRentalMemberById(@PathVariable Long id) {
        return rentalMemberService.getRentalMemberById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RentalMemberResponse createRentalMember(
            @Valid @RequestBody RentalMemberCreateRequest request
    ) {
        return rentalMemberService.createRentalMember(request);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RentalMemberResponse updateRentalMember(
            @PathVariable Long id,
            @Valid @RequestBody RentalMemberUpdateRequest request
    ) {
        return rentalMemberService.updateRentalMember(id, request);
    }

    @PutMapping("/{id}/move-out")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public RentalMemberResponse moveOutRentalMember(
            @PathVariable Long id,
            @Valid @RequestBody RentalMemberMoveOutRequest request
    ) {
        return rentalMemberService.moveOutRentalMember(id, request);
    }
}
