package com.thachbao.room_rental_management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tenants")
public class Tenant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * @OneToOne:
     * Quan hệ 1 - 1 giữa Tenant và User.
     * Ý nghĩa nghiệp vụ: Một hồ sơ tenant có thể liên kết với một tài khoản user.
     * fetch = FetchType.LAZY:
     * Khi lấy Tenant, chưa tải User ngay.
     * Chỉ khi gọi tenant.getUser() thì Hibernate mới tải User.
     * Giúp tránh query thừa.
     * @JoinColumn(name = "user_id"):
     * Cột user_id trong bảng tenants là khóa ngoại trỏ sang users.id.
     * Không dùng private Long userId ở Entity nữa,
     * vì dùng User user sẽ biểu diễn quan hệ database rõ hơn.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    /*
     * fullName ánh xạ với cột full_name.
     */
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    /*
     * phone ở tenants là số điện thoại liên hệ của người thuê.
     * Không nhất thiết phải unique vì đăng nhập đã dùng users.phone unique.
     */
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;
    /*
     * identityNumber là CCCD.
     * unique = true vì một CCCD không nên thuộc nhiều người thuê.
     */
    @Column(name = "identity_number", unique = true, length = 20)
    private String identityNumber;
    /*
     * LocalDate dùng cho ngày tháng không có giờ.
     * date_of_birth trong MySQL là DATE nên Java dùng LocalDate là đúng.
     */
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    /*
     * createdAt tự sinh khi insert.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /*
     * updatedAt tự đổi khi update.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
