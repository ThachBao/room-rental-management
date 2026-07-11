# Hướng Dẫn Kiểm Thử API Bằng Postman

Tài liệu này hướng dẫn chi tiết cách kiểm thử các API của 5 phân hệ (modules) mới triển khai: **Rental Utility Rates**, **Meter Readings**, **Invoices**, **Payments**, và **Maintenance Requests**.

---

## 1. Phân Hệ Đơn Giá Tiện Ích Phòng Thuê (Rental Utility Rates)

### 1.1. Lấy danh sách cấu hình đơn giá
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/rental-utility-rates`
*   **Query Params** (Tùy chọn):
    *   `rentalId`: Lọc theo ID lượt thuê phòng (ví dụ: `1`).
*   **Response Expectation**: Trả về danh sách các đơn giá cấu hình theo các lượt thuê dưới dạng JSON array.

### 1.2. Lấy cấu hình đơn giá theo ID
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/rental-utility-rates/{id}` (ví dụ: `/api/rental-utility-rates/1`)
*   **Response Expectation**: Thông tin chi tiết cấu hình đơn giá với mã `200 OK`.

### 1.3. Tạo cấu hình đơn giá mới
*   **Method**: `POST`
*   **URL**: `http://localhost:8080/api/rental-utility-rates`
*   **Body** (JSON):
    ```json
    {
      "rentalId": 1,
      "electricUnitPrice": 3500.00,
      "waterUnitPrice": 15000.00,
      "internetFee": 100000.00,
      "trashFee": 20000.00,
      "parkingFee": 50000.00,
      "effectiveFromMonth": "2026-07",
      "effectiveToMonth": null,
      "note": "Cấu hình đơn giá mới áp dụng từ tháng 07/2026",
      "createdByUserId": 1
    }
    ```
*   **Response Expectation**: Bản ghi đơn giá được tạo thành công với mã `210 Created`.

### 1.4. Cập nhật cấu hình đơn giá
*   **Method**: `PUT`
*   **URL**: `http://localhost:8080/api/rental-utility-rates/{id}` (ví dụ: `/api/rental-utility-rates/1`)
*   **Body** (JSON):
    ```json
    {
      "electricUnitPrice": 3800.00,
      "waterUnitPrice": 16000.00,
      "internetFee": 120000.00,
      "trashFee": 25000.00,
      "parkingFee": 60000.00,
      "effectiveFromMonth": "2026-07",
      "effectiveToMonth": "2026-12",
      "note": "Cập nhật tăng giá dịch vụ từ tháng 7",
      "createdByUserId": 1
    }
    ```
*   **Response Expectation**: Bản ghi đơn giá được cập nhật mới với mã `200 OK`.

---

## 2. Phân Hệ Chỉ Số Điện Nước (Meter Readings)

### 2.1. Lấy danh sách chỉ số điện nước
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/meter-readings`
*   **Query Params** (Tùy chọn):
    *   `rentalId`: Lọc theo ID lượt thuê.
    *   `roomId`: Lọc theo ID phòng.
    *   `billingMonth`: Lọc theo tháng chốt số (định dạng `yyyy-MM`, ví dụ: `2026-06`).
*   **Response Expectation**: Danh sách các chỉ số điện nước khớp điều kiện lọc.

### 2.2. Lấy chỉ số điện nước theo ID
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/meter-readings/{id}` (ví dụ: `/api/meter-readings/1`)
*   **Response Expectation**: Bản ghi chỉ số chi tiết.

### 2.3. Tạo mới chỉ số điện nước hàng tháng
*   **Method**: `POST`
*   **URL**: `http://localhost:8080/api/meter-readings`
*   **Body** (JSON):
    ```json
    {
      "rentalId": 1,
      "billingMonth": "2026-07",
      "oldElectricNumber": 1320,
      "newElectricNumber": 1510,
      "oldWaterNumber": 272,
      "newWaterNumber": 285
    }
    ```
*   **Lưu ý nghiệp vụ**:
    *   Lượt thuê phải có trạng thái `ACTIVE`.
    *   Không được trùng lặp cặp `(rentalId, billingMonth)`.
    *   Chỉ số mới phải $\ge$ chỉ số cũ. Hệ thống tự động tính toán điện năng tiêu thụ (`electricUsage` = `new` - `old`).
*   **Response Expectation**: Tạo thành công bản ghi điện nước với mã `201 Created`.

### 2.4. Cập nhật số điện nước chốt sai
*   **Method**: `PUT`
*   **URL**: `http://localhost:8080/api/meter-readings/{id}` (ví dụ: `/api/meter-readings/1`)
*   **Body** (JSON):
    ```json
    {
      "oldElectricNumber": 1320,
      "newElectricNumber": 1500,
      "oldWaterNumber": 272,
      "newWaterNumber": 283
    }
    ```
*   **Response Expectation**: Cập nhật thành công, tự tính lại lượng tiêu thụ.

---

## 3. Phân Hệ Hóa Đơn Hàng Tháng (Invoices)

### 3.1. Lấy danh sách hóa đơn
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/invoices`
*   **Query Params** (Tùy chọn):
    *   `status`: Lọc theo trạng thái hóa đơn (`UNPAID`, `PAID`, `OVERDUE`).
    *   `rentalId`: Lọc theo lượt thuê.
    *   `roomId`: Lọc theo phòng.
    *   `billingMonth`: Lọc theo tháng tính tiền.
*   **Response Expectation**: Danh sách các hóa đơn tương ứng.

### 3.2. Lấy thông tin hóa đơn theo ID
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/invoices/{id}`
*   **Response Expectation**: Thông tin chi tiết một hóa đơn kèm các trường snapshot thông tin và tính tổng tiền.

### 3.3. Tạo hóa đơn tự động từ điện nước & đơn giá áp dụng (Generate Invoice)
*   **Method**: `POST`
*   **URL**: `http://localhost:8080/api/invoices`
*   **Body** (JSON):
    ```json
    {
      "rentalId": 1,
      "billingMonth": "2026-07",
      "dueDate": "2026-08-05",
      "otherFee": 50000.00,
      "discountAmount": 100000.00,
      "note": "Hóa đơn tháng 7 - kèm phụ phí sửa cửa và giảm giá hè"
    }
    ```
*   **Lưu ý nghiệp vụ**:
    *   Tháng `billingMonth` phải có dữ liệu chỉ số điện nước đã chốt trước đó.
    *   Hệ thống tự động tìm đơn giá tiện ích đang hiệu lực cho tháng này, tự chụp lại snapshot đơn giá chốt số, tự tính tổng tiền: `totalAmount` = `rentAmount` + `electricAmount` + `waterAmount` + `internetFee` + `trashFee` + `parkingFee` + `otherFee` - `discountAmount`.
*   **Response Expectation**: `201 Created` kèm theo hóa đơn hoàn chỉnh ở trạng thái `UNPAID`.

### 3.4. Cập nhật thông tin hóa đơn chưa thanh toán
*   **Method**: `PUT`
*   **URL**: `http://localhost:8080/api/invoices/{id}`
*   **Body** (JSON):
    ```json
    {
      "dueDate": "2026-08-10",
      "otherFee": 20000.00,
      "discountAmount": 50000.00,
      "note": "Điều chỉnh hạn thanh toán và giảm trừ"
    }
    ```
*   **Lưu ý**: Chỉ hóa đơn đang ở trạng thái `UNPAID` mới được cập nhật. Hệ thống tự động tính toán lại `totalAmount`.
*   **Response Expectation**: `200 OK`.

### 3.5. Đánh dấu hóa đơn quá hạn thanh toán
*   **Method**: `PUT`
*   **URL**: `http://localhost:8080/api/invoices/{id}/mark-overdue`
*   **Response Expectation**: Hóa đơn chuyển trạng thái sang `OVERDUE`.

---

## 4. Phân Hệ Thanh Toán Hóa Đơn (Payments)

### 4.1. Lấy danh sách phiếu thanh toán
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/payments`
*   **Query Params** (Tùy chọn):
    *   `invoiceId`: Lọc theo hóa đơn.
    *   `receivedByUserId`: Lọc theo nhân viên nhận tiền.

### 4.2. Lấy phiếu thanh toán theo ID
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/payments/{id}`

### 4.3. Lập phiếu thanh toán hóa đơn
*   **Method**: `POST`
*   **URL**: `http://localhost:8080/api/payments`
*   **Body** (JSON):
    ```json
    {
      "invoiceId": 2,
      "amount": 4325000.00,
      "paymentMethod": "BANK_TRANSFER",
      "paymentDate": "2026-07-06T10:15:30",
      "receivedByUserId": 1,
      "note": "Khách chuyển khoản BIDV đầy đủ"
    }
    ```
*   **Lưu ý nghiệp vụ**:
    *   Hóa đơn thanh toán phải đang có trạng thái `UNPAID` hoặc `OVERDUE`.
    *   Số tiền thanh toán `amount` phải khớp chính xác với `totalAmount` trên hóa đơn.
    *   Hóa đơn sau khi có phiếu thanh toán này sẽ tự động chuyển sang trạng thái `PAID` và cập nhật trường `paidAt`.
*   **Response Expectation**: Tạo thành công phiếu thanh toán với mã `201 Created`.

---

## 5. Phân Hệ Báo Hỏng & Sửa Chữa (Maintenance Requests)

### 5.1. Lấy danh sách yêu cầu báo hỏng
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/maintenance-requests`
*   **Query Params** (Tùy chọn):
    *   `status`: Lọc theo trạng thái (`PENDING`, `IN_PROGRESS`, `DONE`).
    *   `priority`: Lọc theo mức độ ưu tiên (`LOW`, `MEDIUM`, `HIGH`).
    *   `roomId`, `rentalId`, `tenantId`.

### 5.2. Tạo mới yêu cầu báo hỏng từ khách thuê
*   **Method**: `POST`
*   **URL**: `http://localhost:8080/api/maintenance-requests`
*   **Body** (JSON):
    ```json
    {
      "roomId": 1,
      "rentalId": 1,
      "tenantId": 1,
      "title": "Hỏng khóa cửa ban công",
      "description": "Khóa bị kẹt không thể vặn chốt khóa ngoài",
      "priority": "MEDIUM"
    }
    ```
*   **Response Expectation**: Yêu cầu ở trạng thái ban đầu là `PENDING`. Mã phản hồi `201 Created`.

### 5.3. Cập nhật thông tin yêu cầu báo hỏng
*   **Method**: `PUT`
*   **URL**: `http://localhost:8080/api/maintenance-requests/{id}`
*   **Body** (JSON):
    ```json
    {
      "title": "Hỏng chốt khóa cửa ban công",
      "description": "Khóa bị kẹt không vặn chốt được, cần thợ khóa sửa gấp",
      "priority": "HIGH"
    }
    ```

### 5.4. Cập nhật trạng thái xử lý sự cố (Dành cho Landlord/Quản lý)
*   **Method**: `PUT`
*   **URL**: `http://localhost:8080/api/maintenance-requests/{id}/status`
*   **Body** (JSON):
    ```json
    {
      "status": "IN_PROGRESS",
      "resolvedNote": "Đã gọi thợ khóa hẹn sửa chiều nay",
      "repairCost": 0.00
    }
    ```

### 5.5. Hoàn thành xử lý sự cố (Resolve Request)
*   **Method**: `PUT`
*   **URL**: `http://localhost:8080/api/maintenance-requests/{id}/resolve`
*   **Body** (JSON):
    ```json
    {
      "resolvedNote": "Thợ đã sửa xong chốt khóa và tra dầu trơn tru",
      "repairCost": 150000.00,
      "resolvedAt": "2026-07-08T16:30:00"
    }
    ```
*   **Response Expectation**: Trạng thái chuyển thành `DONE`, ghi nhận chi phí và thời gian hoàn thành.
