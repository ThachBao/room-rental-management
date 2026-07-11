package com.thachbao.room_rental_management.dto.response.tenant;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

/*
 * Response DTO là dữ liệu API trả về cho frontend/Postman.
 *
 * Không trả trực tiếp Tenant entity vì:
 * - Entity có thể chứa quan hệ User.
 * - Dễ lộ dữ liệu nhạy cảm như passwordHash nếu trả sai.
 * - Dễ lỗi vòng lặp JSON khi có nhiều quan hệ.
 */
@Setter
@Getter
@Builder
public class TenantResponse {
    private Long id;

    /*
     * Chỉ trả userId, không trả nguyên object User.
     * Vì User có passwordHash, role, enabled...
     */
    private Long userId;

    private String fullName;

    private String phone;

    private String identityNumber;

    private LocalDate dateOfBirth;

    private String address;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
