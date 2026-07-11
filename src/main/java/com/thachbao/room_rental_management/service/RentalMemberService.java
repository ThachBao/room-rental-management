package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.rental.RentalMemberCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RentalMemberMoveOutRequest;
import com.thachbao.room_rental_management.dto.request.rental.RentalMemberUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.RentalMemberResponse;

import java.util.List;

public interface RentalMemberService {
    List<RentalMemberResponse> getRentalMembers(Long rentalId, Long tenantId);
    RentalMemberResponse getRentalMemberById(Long id);
    RentalMemberResponse createRentalMember(RentalMemberCreateRequest request);
    RentalMemberResponse updateRentalMember(Long id, RentalMemberUpdateRequest request);
    RentalMemberResponse moveOutRentalMember(Long id, RentalMemberMoveOutRequest request);
}
