-- Enable SQL scripting
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE invoices;
TRUNCATE TABLE meter_readings;
TRUNCATE TABLE rental_utility_rates;
TRUNCATE TABLE contract_files;
TRUNCATE TABLE rental_members;
TRUNCATE TABLE maintenance_requests;
TRUNCATE TABLE room_rentals;
TRUNCATE TABLE tenants;
TRUNCATE TABLE rooms;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Table: users
-- Landlord password: 'password123' (hashed using a simple string or BCrypt if required, but for sample data plain or dummy is fine since DB allows it)
-- Note: 'password_hash' is VARCHAR(255). We will use a dummy bcrypt hash: '$2a$10$8.eNl.2pSgT9jE1r9u5W1e8B9Rfg2OJyUoD36Uqj6yFp7Zg/WwZWy'
INSERT INTO users (id, full_name, phone, password_hash, role, enabled, created_at, updated_at) VALUES
(1, 'Nguyen Van A', '0779637353', '$2a$10$8.eNl.2pSgT9jE1r9u5W1e8B9Rfg2OJyUoD36Uqj6yFp7Zg/WwZWy', 'LANDLORD', 1, NOW(), NOW()),
(2, 'Tran Thi B', '0987654321', '$2a$10$8.eNl.2pSgT9jE1r9u5W1e8B9Rfg2OJyUoD36Uqj6yFp7Zg/WwZWy', 'TENANT', 1, NOW(), NOW()),
(3, 'Le Van C', '0901234567', '$2a$10$8.eNl.2pSgT9jE1r9u5W1e8B9Rfg2OJyUoD36Uqj6yFp7Zg/WwZWy', 'TENANT', 1, NOW(), NOW()),
(4, 'Pham Thi D', '0934567890', '$2a$10$8.eNl.2pSgT9jE1r9u5W1e8B9Rfg2OJyUoD36Uqj6yFp7Zg/WwZWy', 'TENANT', 1, NOW(), NOW());

-- 2. Table: rooms
INSERT INTO rooms (id, room_number, floor, area, max_people, base_rent_price, default_deposit_amount, description, status, created_at, updated_at) VALUES
(1, '101', 1, 25.50, 2, 3500000.00, 3500000.00, 'Phòng lầu 1 thoáng mát, cửa sổ lớn', 'OCCUPIED', NOW(), NOW()),
(2, '102', 1, 22.00, 2, 3200000.00, 3200000.00, 'Phòng lầu 1 yên tĩnh, WC riêng', 'OCCUPIED', NOW(), NOW()),
(3, '201', 2, 30.00, 3, 4200000.00, 4200000.00, 'Phòng rộng rãi, ban công lớn hướng mát', 'AVAILABLE', NOW(), NOW());

-- 3. Table: tenants
INSERT INTO tenants (id, user_id, full_name, phone, identity_number, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at) VALUES
(1, 2, 'Tran Thi B', '0987654321', '123456789012', '1998-05-12', '123 Nguyen Trai, Q5, TP.HCM', 'Tran Van M (Bố)', '0909090909', NOW(), NOW()),
(2, 3, 'Le Van C', '0901234567', '234567890123', '1995-10-20', '456 Le Loi, Q1, TP.HCM', 'Le Thi N (Mẹ)', '0911111111', NOW(), NOW()),
(3, 4, 'Pham Thi D', '0934567890', '345678901234', '2000-01-01', '789 CMT8, Q10, TP.HCM', 'Pham Van P (Anh)', '0922222222', NOW(), NOW());

-- 4. Table: room_rentals
INSERT INTO room_rentals (id, room_id, representative_tenant_id, start_date, expected_end_date, move_out_date, monthly_rent_price, deposit_amount, deposit_paid_amount, deposit_paid_at, deposit_status, deposit_deduction_amount, deposit_return_amount, deposit_returned_at, deposit_note, status, created_at, updated_at) VALUES
(1, 1, 1, '2026-01-01', '2026-12-31', NULL, 3500000.00, 3500000.00, 3500000.00, '2026-01-01 10:00:00', 'HELD', 0.00, 0.00, NULL, 'Đã nhận đủ tiền cọc phòng 101', 'ACTIVE', NOW(), NOW()),
(2, 2, 2, '2026-02-01', '2027-01-31', NULL, 3200000.00, 3200000.00, 3200000.00, '2026-02-01 09:30:00', 'HELD', 0.00, 0.00, NULL, 'Đã nhận cọc phòng 102', 'ACTIVE', NOW(), NOW());

-- 5. Table: rental_members
INSERT INTO rental_members (id, rental_id, tenant_id, member_role, move_in_date, move_out_date, note, created_at, updated_at) VALUES
(1, 1, 1, 'REPRESENTATIVE', '2026-01-01', NULL, 'Đại diện thuê phòng 101', NOW(), NOW()),
(2, 2, 2, 'REPRESENTATIVE', '2026-02-01', NULL, 'Đại diện thuê phòng 102', NOW(), NOW()),
(3, 2, 3, 'OCCUPANT', '2026-02-05', NULL, 'Thành viên ở cùng phòng 102', NOW(), NOW());

-- 6. Table: contract_files
INSERT INTO contract_files (id, rental_id, file_name, file_url, file_type, file_size, uploaded_by_user_id, uploaded_at, note) VALUES
(1, 1, 'HopDong_Phong101_NguyenVanB.pdf', 'https://storage.example.com/contracts/hopdong_101.pdf', 'PDF', 1048576, 1, NOW(), 'Hợp đồng thuê bản chính thức'),
(2, 2, 'AnhCCCD_LeVanC.png', 'https://storage.example.com/contracts/cccd_c.png', 'PNG', 524288, 1, NOW(), 'Ảnh chụp CCCD của thành viên phòng 102');

-- 7. Table: rental_utility_rates
INSERT INTO rental_utility_rates (id, rental_id, electric_unit_price, water_unit_price, internet_fee, trash_fee, parking_fee, effective_from_month, effective_to_month, note, created_by_user_id, created_at, updated_at) VALUES
(1, 1, 3500.00, 15000.00, 100000.00, 20000.00, 50000.00, '2026-01', NULL, 'Đơn giá tiện ích chuẩn 2026 cho Phòng 101', 1, NOW(), NOW()),
(2, 2, 3500.00, 15000.00, 100000.00, 20000.00, 50000.00, '2026-02', NULL, 'Đơn giá tiện ích chuẩn 2026 cho Phòng 102', 1, NOW(), NOW());

-- 8. Table: meter_readings
INSERT INTO meter_readings (id, room_id, rental_id, billing_month, old_electric_number, new_electric_number, electric_usage, old_water_number, new_water_number, water_usage, created_at, updated_at) VALUES
(1, 1, 1, '2026-05', 1000, 1150, 150, 250, 260, 10, NOW(), NOW()),
(2, 1, 1, '2026-06', 1150, 1320, 170, 260, 272, 12, NOW(), NOW()),
(3, 2, 2, '2026-05', 500, 620, 120, 120, 128, 8, NOW(), NOW()),
(4, 2, 2, '2026-06', 620, 755, 135, 128, 137, 9, NOW(), NOW());

-- 9. Table: invoices
-- Formula: Total = Rent + (ElecUsage * ElecPrice) + (WaterUsage * WaterPrice) + Internet + Trash + Parking + Other - Discount
-- Invoice 1 (Paid): Room 101 - billing month 2026-05
-- Rent: 3500000.00, Elec: 150 * 3500 = 525000.00, Water: 10 * 15000 = 150000.00
-- Internet: 100000.00, Trash: 20000.00, Parking: 50000.00, Other: 0.00, Discount: 0.00
-- Total: 3500000 + 525000 + 150000 + 100000 + 20000 + 50000 = 4345000.00
INSERT INTO invoices (id, room_id, rental_id, representative_tenant_id, meter_reading_id, utility_rate_id, billing_month, rent_amount, electric_usage, electric_unit_price, electric_amount, water_usage, water_unit_price, water_amount, internet_fee, trash_fee, parking_fee, other_fee, discount_amount, total_amount, due_date, paid_at, status, note, created_at, updated_at) VALUES
(1, 1, 1, 1, 1, 1, '2026-05', 3500000.00, 150, 3500.00, 525000.00, 10, 15000.00, 150000.00, 100000.00, 20000.00, 50000.00, 0.00, 0.00, 4345000.00, '2026-06-05', '2026-06-03 14:22:00', 'PAID', 'Đã thanh toán đúng hạn', NOW(), NOW()),

-- Invoice 2 (Unpaid): Room 101 - billing month 2026-06
-- Rent: 3500000.00, Elec: 170 * 3500 = 595000.00, Water: 12 * 15000 = 180000.00
-- Internet: 100000.00, Trash: 20000.00, Parking: 50000.00, Other: 30000.00 (phát sinh sửa khóa), Discount: 50000.00 (khuyến mãi)
-- Total: 3500000 + 595000 + 180000 + 100000 + 20000 + 50000 + 30000 - 50000 = 4325000.00
(2, 1, 1, 1, 2, 1, '2026-06', 3500000.00, 170, 3500.00, 595000.00, 12, 15000.00, 180000.00, 100000.00, 20000.00, 50000.00, 30000.00, 50000.00, 4325000.00, '2026-07-05', NULL, 'UNPAID', 'Chưa thanh toán hóa đơn tháng 6', NOW(), NOW()),

-- Invoice 3 (Overdue): Room 102 - billing month 2026-05
-- Rent: 3200000.00, Elec: 120 * 3500 = 420000.00, Water: 8 * 15000 = 120000.00
-- Internet: 100000.00, Trash: 20000.00, Parking: 50000.00
-- Total: 3200000 + 420000 + 120000 + 100000 + 20000 + 50000 = 3910000.00
(3, 2, 2, 2, 3, 2, '2026-05', 3200000.00, 120, 3500.00, 420000.00, 8, 15000.00, 120000.00, 100000.00, 20000.00, 50000.00, 0.00, 0.00, 3910000.00, '2026-06-05', NULL, 'OVERDUE', 'Hóa đơn quá hạn thanh toán hơn 1 tháng', NOW(), NOW());

-- 10. Table: payments
INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, received_by_user_id, note, created_at, updated_at) VALUES
(1, 1, 4345000.00, 'BANK_TRANSFER', '2026-06-03 14:22:00', 1, 'Nhận chuyển khoản ngân hàng Vietcombank', NOW(), NOW());

-- 11. Table: maintenance_requests
INSERT INTO maintenance_requests (id, room_id, rental_id, tenant_id, title, description, priority, status, resolved_note, repair_cost, resolved_at, created_at, updated_at) VALUES
(1, 1, 1, 1, 'Hỏng bóng đèn vệ sinh', 'Bóng đèn nhà vệ sinh bị nhấp nháy liên tục rồi tắt hẳn', 'LOW', 'DONE', 'Đã mua bóng đèn tròn điện quang thay thế', 35000.00, '2026-06-10 17:00:00', NOW(), NOW()),
(2, 2, 2, 2, 'Rò rỉ vòi nước lavabo', 'Nước chảy rỉ liên tục từ chân vòi nước bồn rửa mặt gây ẩm ướt sàn', 'MEDIUM', 'IN_PROGRESS', NULL, 0.00, NULL, NOW(), NOW()),
(3, 1, 1, 1, 'Điều hòa không mát', 'Điều hòa bật 18 độ nhưng chỉ có gió nhẹ, không lạnh sâu, nghi hết gas', 'HIGH', 'PENDING', NULL, 0.00, NULL, NOW(), NOW());
