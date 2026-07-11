package com.thachbao.room_rental_management.dto.request.user;

import com.thachbao.room_rental_management.enums.UserRole;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreateRequest {
    private String fullName;
    private String phone;
    private String password;
    private UserRole userRole;
}
