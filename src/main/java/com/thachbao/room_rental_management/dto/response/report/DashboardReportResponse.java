package com.thachbao.room_rental_management.dto.response.report;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardReportResponse {
    private long totalRooms;
    private long availableRooms;
    private long occupiedRooms;
    private long totalTenants;
    private long activeRentals;
    private long unpaidInvoices;
    private long pendingMaintenance;
    private BigDecimal totalRevenue;
}
