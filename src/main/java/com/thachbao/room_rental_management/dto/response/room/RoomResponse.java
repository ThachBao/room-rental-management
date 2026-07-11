package com.thachbao.room_rental_management.dto.response.room;

import com.thachbao.room_rental_management.enums.RoomStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Builder
public class RoomResponse {
    private Long id;

    private String roomNumber;

    private  Integer floor;

    private BigDecimal area;

    private Integer maxPeople;

    private BigDecimal baseRentPrice;

    private BigDecimal defaultDepositAmount;

    private String description;

    private RoomStatus status;

    private LocalDateTime createdAt;

    private  LocalDateTime updatedAt;
}
