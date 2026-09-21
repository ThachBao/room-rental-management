package com.thachbao.room_rental_management.dto.response.rental;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate moveInDate;

    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate moveOutDate;

    private String note;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
}
