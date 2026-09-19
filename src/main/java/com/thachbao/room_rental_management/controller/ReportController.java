package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.response.report.DashboardReportResponse;
import com.thachbao.room_rental_management.dto.response.report.MonthlyRevenueResponse;
import com.thachbao.room_rental_management.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<DashboardReportResponse> getDashboardOverview() {
        return ResponseEntity.ok(reportService.getDashboardOverview());
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<List<MonthlyRevenueResponse>> getMonthlyRevenueReport(
            @RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(reportService.getMonthlyRevenueReport(targetYear));
    }
}
