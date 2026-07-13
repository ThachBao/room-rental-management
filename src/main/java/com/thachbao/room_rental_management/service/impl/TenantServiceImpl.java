package com.thachbao.room_rental_management.service.impl;


import com.thachbao.room_rental_management.dto.request.tenant.TenantCreateRequest;
import com.thachbao.room_rental_management.dto.request.tenant.TenantUpdateRequest;
import com.thachbao.room_rental_management.dto.response.tenant.TenantResponse;
import com.thachbao.room_rental_management.entity.Tenant;
import com.thachbao.room_rental_management.entity.User;
import com.thachbao.room_rental_management.enums.UserRole;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.TenantMapper;
import com.thachbao.room_rental_management.repository.TenantRepository;
import com.thachbao.room_rental_management.repository.UserRepository;
import com.thachbao.room_rental_management.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** @ Service: Báo cho Spring biết đây là class xử lý nghiệp vụ.
 * @ RequiredArgsConstructor: Lombok tự tạo constructor cho các field final:
 * tenantRepository, userRepository, tenantMapper.
 * Nhờ vậy Spring tự inject dependency vào.
 */
@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {
    /** final: Dependency này được truyền qua constructor và không đổi sau khi khởi tạo.*/
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;

    /** @ Transactional(readOnly = true): Hàm này chỉ đọc dữ liệu, không ghi database.
     * readOnly = true giúp Hibernate tối ưu hơn. */
    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants(){
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElse(null);
            if (tenant == null) {
                return List.of();
            }
            return List.of(tenantMapper.toResponse(tenant));
        }
        return tenantRepository.findByIsDeletedFalse()
                .stream()
                .map(tenantMapper::toResponse)
                .toList();
    }
    /** Tìm kiếm tenant theo keyword.
        - Nếu keyword rỗng thì trả toàn bộ danh sách.-
        - Nếu có keyword thì tìm theo tên và số điện thoại.
     */
    @Override
    @Transactional(readOnly = true)
    public  List<TenantResponse> searchTenants(String keyword){
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            return getAllTenants();
        }
        if(keyword   == null  || keyword.isBlank()){
            return getAllTenants();
        }
        String trimKeyword = keyword.trim();
        /** Dùng LinkedHashMap để:
         - Không bị trùng tenant nếu tenant vừa khớp tên vừa khớp phone.
         - Giữ thứ tự insert.
         */
        Map<Long, Tenant> resultMap = new LinkedHashMap<>();

        tenantRepository.findByFullNameContainingIgnoreCaseAndIsDeletedFalse(trimKeyword)
                .forEach(tenant -> resultMap.put(tenant.getId(), tenant));

        tenantRepository.findByPhoneContainingAndIsDeletedFalse(trimKeyword)
                .forEach(tenant -> resultMap.put(tenant.getId(), tenant));

        return resultMap.values()
                .stream()
                .map(tenantMapper::toResponse)
                .toList();
    }
    /** Lấy chi tiết tenant theo id.
     Nếu id không tồn tại, ném ResourceNotFoundException. */
    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long id){
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            if (!tenant.getId().equals(id)) {
                throw new BadRequestException("Bạn không có quyền truy cập hồ sơ người thuê này");
            }
            return tenantMapper.toResponse(tenant);
        }
        Tenant tenant   = findTenantById(id);
        return  tenantMapper.toResponse(tenant);
    }

    /** Thêm người thuê mới*/
    @Override
    @Transactional
    public TenantResponse createTenant(TenantCreateRequest request){
        /** Kiểm tra CCCD có bị trùng không */
        validateIdentityNumberForCreate(request.getIdentityNumber());

        /** Nếu request có userId thì:
          - Tìm user.
          - Kiểm tra user phải là TENANT.
          - Kiểm tra user chưa liên kết với tenant khác.
         */
        User user = resolveUserForCreate(request.getUserId());
        if (user == null && request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user = userRepository.findByPhone(request.getPhone().trim()).orElse(null);
            if (user != null && user.getUserRole() != com.thachbao.room_rental_management.enums.UserRole.TENANT) {
                user = null;
            }
            if (user != null && tenantRepository.existsByUserId(user.getId())) {
                user = null;
            }
        }
        /** Chuyển request thành entity. */
        Tenant tenant = tenantMapper.toEntity(request);
        /** Set user vào tenant. */
        tenant.setUser(user);
        /** Lưu tenant vào database. */
        Tenant savedTenant = tenantRepository.save(tenant);
        /** Chuyển entity đã lưu thành response trả ra API. */
        return tenantMapper.toResponse(savedTenant);
    }

    /** Cập nhật người thuê */
    @Override
    @Transactional
    public TenantResponse updateTenant(Long id, TenantUpdateRequest request){
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant currentTenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            if (!currentTenant.getId().equals(id)) {
                throw new BadRequestException("Bạn không có quyền cập nhật hồ sơ người thuê này");
            }
        }
        /** Lấy tenant hiện tại từ database. */
        Tenant tenant = findTenantById(id);
        /** Kiểm tra CCCD nếu có thay đổi. */
        validateIdentityNumberForUpdate(request.getIdentityNumber(), id);
        /** Kiểm tra userId nếu request muốn liên kết tài khoản. */
        User user = resolveUserForUpdate(request.getUserId(), id);
        if (user == null && request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user = userRepository.findByPhone(request.getPhone().trim()).orElse(null);
            if (user != null && user.getUserRole() != com.thachbao.room_rental_management.enums.UserRole.TENANT) {
                user = null;
            }
            if (user != null && tenantRepository.existsByUserIdAndIdNot(user.getId(), id)) {
                user = null;
            }
        }
        /** Cập nhật các field thông tin cá nhân. */
        tenantMapper.updateEntity(tenant, request);
        /** Nếu user = null thì tenant sẽ bị gỡ liên kết tài khoản.
         Nếu user != null thì tenant liên kết với tài khoản đó.*/
        tenant.setUser(user);

        Tenant updatedTenant = tenantRepository.save(tenant);

        return tenantMapper.toResponse(updatedTenant);
    }

    @Override
    @Transactional
    public void deleteTenant(Long id){
        Tenant tenant = findTenantById(id);

        // Kiểm tra ràng buộc dữ liệu trước khi xóa
        if (tenantRepository.countRentalsByTenantId(id) > 0) {
            throw new BadRequestException("Không thể xóa người thuê này vì họ đang làm Người đại diện trong hợp đồng thuê phòng.");
        }
        if (tenantRepository.countMembersByTenantId(id) > 0) {
            throw new BadRequestException("Không thể xóa người thuê này vì họ đang là Thành viên ở cùng trong phòng trọ.");
        }

        // Thực hiện xóa mềm
        tenant.setDeleted(true);
        tenantRepository.save(tenant);

        User linkedUser = tenant.getUser();
        if (linkedUser != null) {
            linkedUser.setEnabled(false);
            userRepository.save(linkedUser);
        }
    }
    /** Hàm phụ dùng lại nhiều lần.
     - Tìm Tenant theo id.
     - Nếu không có thì ném lỗi 404.
     */
    private Tenant findTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người thuê có id = " + id ));
        if (tenant.isDeleted()) {
            throw new ResourceNotFoundException("Không tìm thấy người thuê có id = " + id );
        }
        return tenant;
    }
    /*
     * Kiểm tra CCCD khi tạo mới.
     */
    private void validateIdentityNumberForCreate(String identityNumber) {
        String normalizedIdentityNumber = normalizeOptionalText(identityNumber);

        if (normalizedIdentityNumber == null) {
            return;
        }

        if (tenantRepository.existsByIdentityNumber(normalizedIdentityNumber)) {
            throw new BadRequestException("CCCD đã tồn tại: " + normalizedIdentityNumber);
        }
    }

    /*
     * Kiểm tra CCCD khi cập nhật.
     *
     * Cho phép tenant giữ nguyên CCCD của chính nó.
     * Không cho dùng CCCD của tenant khác.
     */
    private void validateIdentityNumberForUpdate(String identityNumber, Long tenantId) {
        String normalizedIdentityNumber = normalizeOptionalText(identityNumber);

        if (normalizedIdentityNumber == null) {
            return;
        }

        if (tenantRepository.existsByIdentityNumberAndIdNot(normalizedIdentityNumber, tenantId)) {
            throw new BadRequestException("CCCD đã tồn tại: " + normalizedIdentityNumber);
        }
    }

    /*
     * Xử lý userId khi tạo tenant.
     */
    private User resolveUserForCreate(Long userId) {
        if (userId == null) {
            return null;
        }

        User user = findUserById(userId);

        validateUserIsTenant(user);

        if (tenantRepository.existsByUserId(userId)) {
            throw new BadRequestException("Tài khoản user id = " + userId + " đã liên kết với hồ sơ người thuê khác");
        }

        return user;
    }

    /*
     * Xử lý userId khi cập nhật tenant.
     */
    private User resolveUserForUpdate(Long userId, Long tenantId) {
        if (userId == null) {
            return null;
        }

        User user = findUserById(userId);

        validateUserIsTenant(user);

        if (tenantRepository.existsByUserIdAndIdNot(userId, tenantId)) {
            throw new BadRequestException("Tài khoản user id = " + userId + " đã liên kết với hồ sơ người thuê khác");
        }

        return user;
    }

    /*
     * Tìm user theo id.
     */
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user có id = " + userId));
    }

    /*
     * Tenant chỉ được liên kết với tài khoản có role TENANT.
     *
     * Không cho liên kết tenant với tài khoản LANDLORD.
     */
    private void validateUserIsTenant(User user) {
        if (user.getUserRole() != UserRole.TENANT) {
            throw new BadRequestException("Chỉ tài khoản có role TENANT mới được liên kết với hồ sơ người thuê");
        }
    }

    /** Chuẩn hóa text optional:
     * - null -> null
     * - "" -> null
     * - "   " -> null
     * - "  abc  " -> "abc"
     */
    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
