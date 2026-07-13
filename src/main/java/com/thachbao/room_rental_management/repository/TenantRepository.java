package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Repository cho bảng tenants.
 JpaRepository<Tenant, Long>:
 - Tenant là entity.
 - Long là kiểu của khóa chính id.
 */
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    /*
     * Kiểm tra CCCD đã tồn tại chưa khi thêm mới tenant.
     */
    boolean existsByIdentityNumber(String identityNumber);

    /*
     * Kiểm tra CCCD đã tồn tại ở người khác chưa khi cập nhật tenant.
     */
    boolean existsByIdentityNumberAndIdNot(String identityNumber, Long id);

    /*
     * Vì Tenant có field: private User user;
     * Nên findByUserId nghĩa là tìm theo user.id.
     */
//    Optional<Tenant> findByUserId(Long userId);

    /*
     * Kiểm tra user_id đã được gắn với tenant nào chưa.
     * Dùng khi tạo tenant.
     */
    boolean existsByUserId(Long userId);

    /*
     * Kiểm tra user_id đã được gắn với tenant khác chưa.
     * Dùng khi cập nhật tenant.
     */
    boolean existsByUserIdAndIdNot(Long userId, Long id);

    /*
     * Tìm kiếm người thuê theo tên.
     * Containing = chứa keyword.
     * IgnoreCase = không phân biệt hoa thường.
     */
    List<Tenant> findByFullNameContainingIgnoreCase(String fullName);

    /*
     * Tìm kiếm người thuê theo số điện thoại.
     */
    List<Tenant> findByPhoneContaining(String phone);

    Optional<Tenant> findByPhone(String phone);

    Optional<Tenant> findByUser_Phone(String phone);

    List<Tenant> findByIsDeletedFalse();

    List<Tenant> findByFullNameContainingIgnoreCaseAndIsDeletedFalse(String fullName);

    List<Tenant> findByPhoneContainingAndIsDeletedFalse(String phone);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM room_rentals WHERE representative_tenant_id = :tenantId AND status != 'TERMINATED'", nativeQuery = true)
    long countRentalsByTenantId(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM rental_members WHERE tenant_id = :tenantId AND move_out_date IS NULL", nativeQuery = true)
    long countMembersByTenantId(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM maintenance_requests WHERE tenant_id = :tenantId", nativeQuery = true)
    long countMaintenanceRequestsByTenantId(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);
}
