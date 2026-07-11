package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.tenant.TenantCreateRequest;
import com.thachbao.room_rental_management.dto.request.tenant.TenantUpdateRequest;
import com.thachbao.room_rental_management.dto.response.tenant.TenantResponse;

import java.util.List;

/*
 * Service interface là bản hợp đồng chức năng của module Tenant.
 * Controller chỉ gọi interface này, không cần biết bên trong xử lý thế nào.
 */
public interface TenantService {
    /** Lấy toàn bộ người thuê. */
    List<TenantResponse> getAllTenants();
    /** Tìm người thuê theo tên hoặc số điện thoại. */
    List<TenantResponse> searchTenants(String keyword);
    /** Lấy chi tiết một người thuê theo id. */
    TenantResponse getTenantById(Long id);
    /** Thêm người thuê mới*/
    TenantResponse createTenant(TenantCreateRequest request);
    /** Cập nhật người thuê */
    TenantResponse updateTenant(Long id, TenantUpdateRequest request);
    /** Xoá  người thuê */
    void deleteTenant(Long id);

}
