package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.response.report.DashboardReportResponse;
import com.thachbao.room_rental_management.dto.response.report.MonthlyRevenueResponse;
import com.thachbao.room_rental_management.entity.Invoice;
import com.thachbao.room_rental_management.enums.InvoiceStatus;
import com.thachbao.room_rental_management.enums.MaintenanceStatus;
import com.thachbao.room_rental_management.enums.RentalStatus;
import com.thachbao.room_rental_management.enums.RoomStatus;
import com.thachbao.room_rental_management.repository.*;
import com.thachbao.room_rental_management.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final RoomRentalRepository roomRentalRepository;
    private final InvoiceRepository invoiceRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardReportResponse getDashboardOverview() {
        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.findByStatus(RoomStatus.AVAILABLE).size();
        long occupiedRooms = roomRepository.findByStatus(RoomStatus.OCCUPIED).size();
        long totalTenants = tenantRepository.count();
        long activeRentals = roomRentalRepository.findByStatus(RentalStatus.ACTIVE).size();
        long unpaidInvoices = invoiceRepository.findByStatus(InvoiceStatus.UNPAID).size()
                + invoiceRepository.findByStatus(InvoiceStatus.OVERDUE).size();
        long pendingMaintenance = maintenanceRequestRepository.findByStatus(MaintenanceStatus.PENDING).size()
                + maintenanceRequestRepository.findByStatus(MaintenanceStatus.IN_PROGRESS).size();

        BigDecimal totalRevenue = paymentRepository.findAll().stream()
                .map(payment -> payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardReportResponse.builder()
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .occupiedRooms(occupiedRooms)
                .totalTenants(totalTenants)
                .activeRentals(activeRentals)
                .unpaidInvoices(unpaidInvoices)
                .pendingMaintenance(pendingMaintenance)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyRevenueResponse> getMonthlyRevenueReport(int year) {
        String yearPrefix = String.valueOf(year) + "-";
        List<Invoice> paidInvoices = invoiceRepository.findByStatus(InvoiceStatus.PAID).stream()
                .filter(inv -> inv.getBillingMonth() != null && inv.getBillingMonth().startsWith(yearPrefix))
                .collect(Collectors.toList());

        Map<String, List<Invoice>> groupedByMonth = paidInvoices.stream()
                .collect(Collectors.groupingBy(Invoice::getBillingMonth));

        List<MonthlyRevenueResponse> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String monthKey = String.format("%d-%02d", year, m);
            List<Invoice> monthInvoices = groupedByMonth.getOrDefault(monthKey, Collections.emptyList());
            BigDecimal rev = monthInvoices.stream()
                    .map(inv -> inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(MonthlyRevenueResponse.builder()
                    .month(monthKey)
                    .revenue(rev)
                    .paidInvoicesCount(monthInvoices.size())
                    .build());
        }

        return result;
    }
}
