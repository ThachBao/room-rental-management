package com.thachbao.room_rental_management.dto.response.tenant;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate dateOfBirth;

    private String address;

    private String emergencyContactName;

    private String emergencyContactPhone;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
}
