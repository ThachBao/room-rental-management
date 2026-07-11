package com.thachbao.room_rental_management.dto.request.tenant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/*
 * Request DTO là class hứng dữ liệu client gửi lên.
 * Không dùng trực tiếp Entity Tenant để nhận request,
 * vì client không nên gửi toàn bộ dữ liệu database.
 */
@Setter
@Getter
public class TenantCreateRequest {
    /*
     * userId là id tài khoản user muốn liên kết với tenant.
     *
     * Có thể null:
     * - null nghĩa là tạo hồ sơ tenant chưa có tài khoản đăng nhập.
     * - có giá trị nghĩa là liên kết tenant với user đó.
     */
    private Long userId;
    /*
     * @NotBlank: Chỉ dùng cho String.
     * Không cho null, không cho chuỗi rỗng "", không cho toàn khoảng trắng "   ".
     * @Size(max = 100): Giới hạn độ dài tối đa 100 ký tự.
     */
    @NotBlank(message = "Họ tên người thuê không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt qu 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;

    /*
     * CCCD có thể null vì không phải lúc nào chủ trọ cũng nhập ngay.
     * Nhưng nếu nhập thì không được vượt quá 20 ký tự.
     */
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
