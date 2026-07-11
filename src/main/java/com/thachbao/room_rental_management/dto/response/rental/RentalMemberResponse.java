package com.thachbao.room_rental_management.dto.response.rental;

import com.thachbao.room_rental_management.enums.RentalMemberRole;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalMemberResponse {
    private Long id;
    private Long rentalId;
    private Long tenantId;
    private String tenantName;
    private String roomNumber;
    private RentalMemberRole memberRole;
    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
