package com.thachbao.room_rental_management.dto.request.rental;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RentalMemberMoveOutRequest {
    @NotNull(message = "Ngày chuyển ra không được để trống")
    private LocalDate moveOutDate;

    private String note;
}
