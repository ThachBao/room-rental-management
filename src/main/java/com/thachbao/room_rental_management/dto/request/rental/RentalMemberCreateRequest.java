package com.thachbao.room_rental_management.dto.request.rental;

import com.thachbao.room_rental_management.enums.RentalMemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RentalMemberCreateRequest {
    @NotNull(message = "Lượt thuê không được để trống")
    private Long rentalId;

    @NotNull(message = "Người thuê không được để trống")
    private Long tenantId;

    @NotNull(message = "Vai trò thành viên không được để trống")
    private RentalMemberRole memberRole;

    @NotNull(message = "Ngày chuyển vào không được để trống")
    private LocalDate moveInDate;

    private String note;
}
