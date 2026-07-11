package com.thachbao.room_rental_management.entity;

import com.thachbao.room_rental_management.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter /* Lombok tự sinh các hàm getId(), getFullName(), getPhone() */
@Setter /* Lombok tự sinh các hàm setFullName(), setPhone() */
@NoArgsConstructor /*  Tạo constructor rỗng. JPA/Hibernate bắt buộc cần constructor rỗng để tạo object. */
@AllArgsConstructor /* Tạo constructor có đầy đủ tham số */
@Builder /* Cho phép tạo object theo kiểu User.builder().fullName(...).build()*/
@Entity /* Báo cho JPA biết class này là một entity ánh xạ với bảng trong database */
@Table(name = "users") /* Chỉ rõ class User ánh xạ với bảng users */
public class User {
    /*
     * @Id: Đánh dấu đây là khóa chính.
     * @GeneratedValue(strategy = GenerationType.IDENTITY):
     id tự tăng theo AUTO_INCREMENT của MySQL.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    /*
     * @Column: Ánh xạ field Java với cột trong database.
     * name = "full_name": Cột trong DB tên là full_name.
     * nullable = false: Không cho null, tương ứng NOT NULL trong DB.
     * length = 100:  Độ dài tối đa của VARCHAR.
     */
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    /*
     * phone là số điện thoại đăng nhập.
     * unique = true vì bảng users.phone là duy nhất.
     */
    @Column(name = "phone", nullable = false, unique = true, length = 20)
    private String phone;
    /*
     * passwordHash ánh xạ với cột password_hash.
     * Sau này làm Auth thật, field này sẽ lưu mật khẩu đã mã hóa BCrypt,
     * không lưu mật khẩu gốc.
     */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    /*
     * @Enumerated(EnumType.STRING): Lưu enum dưới dạng chữ trong DB.
     * Ví dụ: UserRole.TENANT sẽ lưu là "TENANT".
     * Không dùng EnumType.ORDINAL vì nó lưu 0, 1, dễ lỗi nếu sau này đổi thứ tự enum.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole userRole;
    /*
     * @Builder.Default: Khi dùng builder mà không truyền enabled,
     * giá trị mặc định vẫn là true.
     */
    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;
    /*
     * @CreationTimestamp: Hibernate tự set thời gian tạo bản ghi.
     * updatable = false: Sau khi tạo rồi thì không update field này nữa.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    /*
     * @UpdateTimestamp: Hibernate tự cập nhật thời gian mỗi khi bản ghi bị update.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
