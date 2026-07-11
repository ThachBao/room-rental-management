package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.response.user.UserResponse;
import com.thachbao.room_rental_management.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    @Value("${app.security.root-phone:0779637353}")
    private String rootPhone;

    public UserResponse toResponse(User entity) {
        if (entity == null) {
            return null;
        }

        boolean isRoot = entity.getPhone() != null && entity.getPhone().equals(rootPhone);

        return UserResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .phone(entity.getPhone())
                .userRole(entity.getUserRole())
                .enabled(entity.isEnabled())
                .root(isRoot)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
