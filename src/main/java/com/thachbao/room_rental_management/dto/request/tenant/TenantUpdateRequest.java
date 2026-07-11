package com.thachbao.room_rental_management.dto.request.tenant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TenantUpdateRequest {
    /*
     * Nếu userId = null khi update:
     * hệ thống sẽ gỡ liên kết tài khoản đăng nhập khỏi tenant.
     */
    private Long userId;

    @NotBlank(message = "Họ tên người thuê không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt qu 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;

    @Size(max = 20, message = "CCCD không được vượt quá 20 ký tự")
    private String identityNumber;

    @Past(message = "Ngày sinh phải nhỏ hơn ngày hiện tại")
    private LocalDate dateOfBirth;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Size(max = 100, message = "Tên người liên h khẩn cấp không được vượt quá 100 ký tự")
    private String emergencyContactName;

    @Size(max = 20, message = "Số điện thoại khẩn cấp không được vượt quá 20 ký tự")
    private String emergencyContactPhone;
}
