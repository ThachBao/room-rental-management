package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.tenant.TenantCreateRequest;
import com.thachbao.room_rental_management.dto.request.tenant.TenantUpdateRequest;
import com.thachbao.room_rental_management.dto.response.tenant.TenantResponse;
import com.thachbao.room_rental_management.entity.Tenant;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Component;

/*
 * @Component:
 * Báo cho Spring biết class này là một bean.
 * Nhờ vậy Spring có thể inject TenantMapper vào Service bằng constructor.
 *  Mapper chỉ làm nhiệm vụ chuyển đổi dữ liệu:
 * Request DTO -> Entity
 * Entity -> Response DTO
 * Mapper KHÔNG gọi database.
 * Vì gọi database là nhiệm vụ của Repository.
 */
@Component
public class TenantMapper {
    /*
     * Chuyển dữ liệu từ request thêm mới sang Tenant entity.
     * Lưu ý:
     * Không set user ở đây.
     * Vì muốn set user thì phải tìm User trong database.
     * Việc đó thuộc TenantServiceImpl.
     */
    
    public Tenant toEntity(TenantCreateRequest request){
        return Tenant.builder()
                .fullName(trim(request.getFullName()))
                .phone(trim(request.getPhone()))
                .identityNumber(blankToNull(request.getIdentityNumber()))
                .dateOfBirth(request.getDateOfBirth())
                .address(blankToNull(request.getAddress()))
                .emergencyContactName(blankToNull(request.getEmergencyContactName()))
                .emergencyContactPhone(blankToNull(request.getEmergencyContactPhone()))
                .build();
    }
    /*
     * Cập nhật dữ liệu từ request vào entity đã lấy từ database.
     * Không tạo Tenant mới, mà sửa trên object Tenant hiện tại.
     */
    public void updateEntity(Tenant tenant, TenantUpdateRequest request){
        tenant.setFullName(trim(request.getFullName()));
        tenant.setPhone(trim(request.getPhone()));
        tenant.setIdentityNumber(blankToNull(request.getIdentityNumber()));
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setAddress(blankToNull(request.getAddress()));
        tenant.setEmergencyContactName(blankToNull(request.getEmergencyContactName()));
        tenant.setEmergencyContactPhone(blankToNull(request.getEmergencyContactPhone()));
    }
    /*
     * Chuyển Tenant entity thành TenantResponse để trả ra API.
     */
    public TenantResponse toResponse(Tenant tenant){
        return TenantResponse.builder()
                .id(tenant.getId())
        /*
         * tenant.getUser() có thể null.
         * Nếu null thì userId trả về null.
         */
                .userId(tenant.getUser() != null ? tenant.getUser().getId() : null)
                .fullName(tenant.getFullName())
                .phone(tenant.getPhone())
                .identityNumber(tenant.getIdentityNumber())
                .dateOfBirth(tenant.getDateOfBirth())
                .address(tenant.getAddress())
                .emergencyContactName(tenant.getEmergencyContactName())
                .emergencyContactPhone(tenant.getEmergencyContactPhone())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }

    /*
     * blankToNull: Nếu người dùng gửi "" hoặc "   " thì đổi thành null.
     * Dữ liệu trong database sẽ sạch hơn.
     */
    private String blankToNull(String value) {
        if(value  == null || value.isBlank()){
            return null;
        }
        return value.trim();
    }
    /*
     * trim:
     * Xóa khoảng trắng đầu/cuối.
     */
    private String trim(String value) {
        return value == null ? null  : value.trim();
    }
}
