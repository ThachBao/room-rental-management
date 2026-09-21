package com.thachbao.room_rental_management.dto.response.meter;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeterReadingResponse {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private Long rentalId;
    private String billingMonth;
    private Integer oldElectricNumber;
    private Integer newElectricNumber;
    private Integer electricUsage;
    private Integer oldWaterNumber;
    private Integer newWaterNumber;
    private Integer waterUsage;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
}
