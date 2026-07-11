package com.thachbao.room_rental_management.dto.request.user;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    private String phone;
    private String password;
}
