package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.user.LoginRequest;
import com.thachbao.room_rental_management.dto.request.user.UserCreateRequest;
import com.thachbao.room_rental_management.dto.request.user.UserUpdateRequest;
import com.thachbao.room_rental_management.dto.response.user.UserResponse;
import com.thachbao.room_rental_management.entity.User;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.UserMapper;
import com.thachbao.room_rental_management.repository.UserRepository;
import com.thachbao.room_rental_management.service.UserService;
import com.thachbao.room_rental_management.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.thachbao.room_rental_management.repository.TenantRepository tenantRepository;

    @org.springframework.beans.factory.annotation.Value("${app.security.root-phone:0779637353}")
    private String rootPhone;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản có id = " + id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new BadRequestException("Số điện thoại không được để trống");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Mật khẩu không được để trống");
        }
        if (request.getPassword().trim().length() < 6) {
            throw new BadRequestException("Mật khẩu phải chứa ít nhất 6 ký tự");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new BadRequestException("Số điện thoại này đã được sử dụng");
        }

        // Role restriction check for creating LANDLORD accounts
        if (request.getUserRole() == com.thachbao.room_rental_management.enums.UserRole.LANDLORD) {
            String currentUserPhone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin tài khoản đang đăng nhập"));
            if (!currentUserPhone.equals(rootPhone)) {
                throw new BadRequestException("Chỉ tài khoản Quản trị viên tối cao (Root Account) mới được quyền tạo tài khoản Quản trị viên khác.");
            }
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userRole(request.getUserRole())
                .enabled(true)
                .build();

        user = userRepository.save(user);

        if (user.getUserRole() == com.thachbao.room_rental_management.enums.UserRole.TENANT) {
            final User finalUser = user;
            tenantRepository.findByPhone(user.getPhone()).ifPresent(tenant -> {
                if (tenant.getUser() == null) {
                    tenant.setUser(finalUser);
                    tenantRepository.save(tenant);
                }
            });
        }

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản có id = " + id));

        String currentUserPhone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin tài khoản đang đăng nhập"));
        
        boolean isCurrentUserRoot = currentUserPhone.equals(rootPhone);

        // 1. Prevent non-root from editing Root Account
        if (user.getPhone() != null && user.getPhone().equals(rootPhone)) {
            if (!isCurrentUserRoot) {
                throw new BadRequestException("Bạn không có quyền chỉnh sửa tài khoản Quản trị viên tối cao (Root Account)");
            }
            if (request.getEnabled() != null && !request.getEnabled()) {
                throw new BadRequestException("Không thể khóa tài khoản Quản trị viên tối cao (Root Account)");
            }
            if (request.getUserRole() != null && request.getUserRole() != com.thachbao.room_rental_management.enums.UserRole.LANDLORD) {
                throw new BadRequestException("Không thể thay đổi vai trò của tài khoản Quản trị viên tối cao (Root Account)");
            }
        }

        // 2. Prevent non-root from editing other Landlords (Managers)
        if (user.getUserRole() == com.thachbao.room_rental_management.enums.UserRole.LANDLORD && !user.getPhone().equals(currentUserPhone)) {
            if (!isCurrentUserRoot) {
                throw new BadRequestException("Bạn không có quyền chỉnh sửa tài khoản Quản trị viên khác");
            }
        }

        // 3. Prevent non-root from promoting a user to LANDLORD role
        if (request.getUserRole() == com.thachbao.room_rental_management.enums.UserRole.LANDLORD && user.getUserRole() != com.thachbao.room_rental_management.enums.UserRole.LANDLORD) {
            if (!isCurrentUserRoot) {
                throw new BadRequestException("Chỉ tài khoản Quản trị viên tối cao (Root Account) mới có quyền cấp quyền Quản trị viên.");
            }
        }

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            userRepository.findByPhone(request.getPhone()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new BadRequestException("Số điện thoại này đã được sử dụng");
                }
            });
            user.setPhone(request.getPhone());

            if (user.getUserRole() == com.thachbao.room_rental_management.enums.UserRole.TENANT) {
                final User finalUser = user;
                tenantRepository.findByPhone(user.getPhone()).ifPresent(tenant -> {
                    if (tenant.getUser() == null) {
                        tenant.setUser(finalUser);
                        tenantRepository.save(tenant);
                    }
                });
            }
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            if (request.getPassword().trim().length() < 6) {
                throw new BadRequestException("Mật khẩu mới phải chứa ít nhất 6 ký tự");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getUserRole() != null) {
            user.setUserRole(request.getUserRole());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản có id = " + id));
        if (user.getPhone() != null && user.getPhone().equals(rootPhone)) {
            throw new BadRequestException("Không thể xóa tài khoản Quản trị viên tối cao (Root Account)");
        }

        String currentUserPhone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin tài khoản đang đăng nhập"));
        
        if (user.getUserRole() == com.thachbao.room_rental_management.enums.UserRole.LANDLORD) {
            if (!currentUserPhone.equals(rootPhone)) {
                throw new BadRequestException("Bạn không có quyền xóa tài khoản Quản trị viên khác");
            }
        }

        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản có id = " + id));
        if (user.getPhone() != null && user.getPhone().equals(rootPhone)) {
            throw new BadRequestException("Không thể khóa tài khoản Quản trị viên tối cao (Root Account)");
        }

        String currentUserPhone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin tài khoản đang đăng nhập"));
        
        if (user.getUserRole() == com.thachbao.room_rental_management.enums.UserRole.LANDLORD) {
            if (!currentUserPhone.equals(rootPhone)) {
                throw new BadRequestException("Bạn không có quyền khóa/mở khóa tài khoản Quản trị viên khác");
            }
        }

        user.setEnabled(!user.isEnabled());
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse login(LoginRequest request) {
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new BadRequestException("Số điện thoại không được để trống");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Mật khẩu không được để trống");
        }

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new BadRequestException("Số điện thoại hoặc mật khẩu không chính xác"));

        if (!user.isEnabled()) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ chủ trọ.");
        }

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!passwordMatches) {
            throw new BadRequestException("Số điện thoại hoặc mật khẩu không chính xác");
        }

        String token = jwtTokenProvider.generateTokenFromUsername(user.getPhone());
        UserResponse response = userMapper.toResponse(user);
        response.setToken(token);
        return response;
    }
}
