package com.thachbao.room_rental_management.dto.response.user;

import com.thachbao.room_rental_management.enums.UserRole;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String phone;
    private UserRole userRole;
    private boolean enabled;
    private boolean root;
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
