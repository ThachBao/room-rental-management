package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.tenant.TenantCreateRequest;
import com.thachbao.room_rental_management.dto.request.tenant.TenantUpdateRequest;
import com.thachbao.room_rental_management.dto.response.tenant.TenantResponse;
import com.thachbao.room_rental_management.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** @ RestController: Đánh dấu class này là REST API controller.
 Các hàm trong class sẽ trả JSON, không trả view HTML.
 @ RequestMapping("/api/tenants"): Tất cả API trong class này đều bắt đầu bằng /api/tenants.
 @ RequiredArgsConstructor: Lombok tự tạo constructor cho field final tenantService.
 Spring sẽ inject TenantService vào controller.
 */
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
public class TenantController {

    private final TenantService tenantService;
    /** @ GetMapping: Xử lý request GET /api/tenants
     * @ RequestParam(required = false): keyword là query parameter, có thể có hoặc không.
     */
    @GetMapping
    public List<TenantResponse> getAllTenants(
            @RequestParam(required = false) String keyword
    ) {
        if (keyword != null && !keyword.isBlank()) {
            return tenantService.searchTenants(keyword);
        }

        return tenantService.getAllTenants();
    }

    /** @ GetMapping("/{id}"): Xử lý request GET /api/tenants/1
     @ PathVariable: Lấy giá trị id trên URL đưa vào biến Long id.
     */
    @GetMapping("/{id}")
    public TenantResponse getTenantById(@PathVariable Long id) {
        return tenantService.getTenantById(id);
    }

    /** @ PostMapping: Xử lý request POST /api/tenants
     ResponseStatus(HttpStatus.CREATED): Nếu tạo thành công thì trả HTTP 201 Created.
     Valid: Kích hoạt validation trong TenantCreateRequest.
     RequestBody: Lấy JSON body từ request và map vào TenantCreateRequest.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('LANDLORD')")
    public TenantResponse createTenant(@Valid @RequestBody TenantCreateRequest request) {
        return tenantService.createTenant(request);
    }

    /** PUT /api/tenants/{id}
     Dùng để cập nhật toàn bộ thông tin tenant.
     */
    @PutMapping("/{id}")
    public TenantResponse updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody TenantUpdateRequest request
    ) {
        return tenantService.updateTenant(id, request);
    }

    /** DELETE /api/tenants/{id}
     Xóa tenant.
     Thành công thì trả 204 No Content.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('LANDLORD')")
    public void deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
    }
}
