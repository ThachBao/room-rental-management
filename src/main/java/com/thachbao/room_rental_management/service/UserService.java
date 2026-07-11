package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.user.LoginRequest;
import com.thachbao.room_rental_management.dto.request.user.UserCreateRequest;
import com.thachbao.room_rental_management.dto.request.user.UserUpdateRequest;
import com.thachbao.room_rental_management.dto.response.user.UserResponse;
import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
    UserResponse toggleUserStatus(Long id);
    UserResponse login(LoginRequest request);
}
