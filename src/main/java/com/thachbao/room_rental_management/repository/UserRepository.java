package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/*
 * Repository là tầng làm việc với database.
 * JpaRepository<User, Long> nghĩa là:
 * - Entity đang quản lý là User.
 * - Kiểu dữ liệu khóa chính của User là Long.
 * JpaRepository tự có sẵn:
 * findAll()
 * findById()
 * save()
 * delete()
 * existsById()
 */
public interface UserRepository extends JpaRepository<User, Long> {
    /*
     * Spring Data JPA tự hiểu tên hàm này.
     * findByPhone(String phone)
     * tương đương SQL: SELECT * FROM users WHERE phone = ?
     * Optional<User> nghĩa là có thể tìm thấy hoặc không tìm thấy.
     */
    Optional<User> findByPhone(String phone);
    /*
     * Kiểm tra số điện thoại đã tồn tại chưa.
     * Dùng trong đăng ký tài khoản.
     */
    boolean existsByPhone(String phone);

}
