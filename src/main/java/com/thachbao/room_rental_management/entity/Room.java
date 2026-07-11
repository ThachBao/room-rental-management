package com.thachbao.room_rental_management.entity;

import com.thachbao.room_rental_management.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "rooms")
public class Room {

    /*
     * @Id: Đánh dấu field id là khóa chính của entity.
     * @GeneratedValue(strategy = GenerationType.IDENTITY):
     * id tự tăng theo AUTO_INCREMENT của MySQL.
     * Trong SQL: id BIGINT AUTO_INCREMENT PRIMARY KEY
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * @Column: Ánh xạ field roomNumber với cột room_number trong bảng rooms.
     * name = "room_number": Tên cột trong database.
     * nullable = false: Không cho null, tương ứng NOT NULL trong SQL.
     * unique = true: Mã phòng không được trùng.
     * length = 50: Tương ứng VARCHAR(50).
     * Trong SQL: room_number VARCHAR(50) NOT NULL UNIQUE
     */
    @Column(name = "room_number", nullable = false, unique = true, length = 50)
    private String roomNumber;

    /*
     * floor trong SQL là: floor INT
     * Không có NOT NULL, nên có thể null.
     * Vì vậy dùng Integer thay vì int.
     * int không chứa được null, nếu không nhập sẽ tự thành 0.
     * Integer có thể null, đúng với database hơn.
     */
    @Column(name = "floor")
    private Integer floor;

    /*
     * area là diện tích phòng.
     * BigDecimal dùng cho số tiền hoặc số thập phân cần chính xác.
     * Không nên dùng double cho dữ liệu tiền hoặc decimal trong database.
     * precision = 8, scale = 2:
     * Tương ứng DECIMAL(8,2).
     * DECIMAL(8,2) nghĩa là tối đa 8 chữ số, trong đó có 2 chữ số sau dấu phẩy.
     * Trong SQL: area DECIMAL(8,2) NOT NULL
     */
    @Column(name = "area", nullable = false, precision = 8, scale = 2)
    private BigDecimal area;
    /*
     * maxPeople là số người tối đa của phòng.
     * Trong SQL: max_people INT NOT NULL
     * Dùng Integer để nếu dữ liệu request thiếu thì có thể phát hiện null rõ ràng ở tầng DTO.
     */
    @Column(name = "max_people", nullable = false)
    private Integer maxPeople;
    /*
     * baseRentPrice là giá thuê mặc định của phòng.
     * Trong SQL: base_rent_price DECIMAL(15,2) NOT NULL
     * Dùng BigDecimal vì đây là dữ liệu tiền.
     */
    @Column(name = "base_rent_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal baseRentPrice;

    /*
     * defaultDepositAmount là tiền cọc mặc định của phòng.
     * Trong SQL: default_deposit_amount DECIMAL(15,2) NOT NULL
     */
    @Column(name = "default_deposit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal defaultDepositAmount;
    /*
     * description là mô tả phòng.
     * columnDefinition = "TEXT":
     * Ép JPA hiểu cột này là TEXT trong database.
     * Trong SQL: description TEXT
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /*
     * @Enumerated(EnumType.STRING):
     * Lưu enum RoomStatus dưới dạng chữ trong database.
     * Không dùng EnumType.ORDINAL vì nó sẽ lưu 0, 1, 2...
     * Nếu sau này đổi thứ tự enum thì dữ liệu cũ dễ bị sai nghĩa.
     * @Builder.Default:
     * Khi dùng Room.builder() mà không truyền status,
     * status mặc định vẫn là AVAILABLE.
     * Trong SQL: status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE'
     */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RoomStatus status = RoomStatus.AVAILABLE;
    /*
     * @CreationTimestamp:
     * Hibernate tự set thời điểm tạo bản ghi.
     * updatable = false: Sau khi tạo rồi thì không cho update lại createdAt.
     * Trong SQL: created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    /*
     * @UpdateTimestamp:
     * Hibernate tự cập nhật thời điểm mỗi khi entity bị update.
     * Trong SQL: updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}