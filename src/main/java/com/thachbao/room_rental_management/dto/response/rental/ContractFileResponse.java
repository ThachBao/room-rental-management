package com.thachbao.room_rental_management.dto.response.rental;

import com.thachbao.room_rental_management.enums.FileType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractFileResponse {
    private Long id;
    private Long rentalId;
    private String fileName;
    private String fileUrl;
    private FileType fileType;
    private Long fileSize;
    private Long uploadedByUserId;
    private String uploadedByUserName;
    private LocalDateTime uploadedAt;
    private String note;
}
