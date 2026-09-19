package com.thachbao.room_rental_management.dto.response.report;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyRevenueResponse {
    private String month;
    private BigDecimal revenue;
    private long paidInvoicesCount;
}
