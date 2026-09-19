package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.response.report.DashboardReportResponse;
import com.thachbao.room_rental_management.dto.response.report.MonthlyRevenueResponse;

import java.util.List;

public interface ReportService {
    DashboardReportResponse getDashboardOverview();
    List<MonthlyRevenueResponse> getMonthlyRevenueReport(int year);
}
