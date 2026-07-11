package com.thachbao.room_rental_management.dto.request.rental;

import com.thachbao.room_rental_management.enums.FileType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractFileUpdateRequest {
    @NotBlank(message = "Tên tệp không được để trống")
    private String fileName;

    @NotBlank(message = "Đường dẫn tệp không được để trống")
    private String fileUrl;

    @NotNull(message = "Định dạng tệp không được để trống")
    private FileType fileType;

    @NotNull(message = "Dung lượng tệp không được để trống")
    @Min(value = 1, message = "Dung lượng tệp phải lớn hơn 0")
    private Long fileSize;

    private String note;
}
