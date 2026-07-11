# 🏠 Room Rental Management System (RRMS)

<div align="center">

**Hệ thống Quản lý Nhà trọ và Cho thuê Phòng chuyên nghiệp**  
Dự án được xây dựng bằng **Spring Boot (REST API)**, **React (Vite - SPA)** và **MySQL**.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-REST%20API-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%2019-blue)
![Vite](https://img.shields.io/badge/Build-Vite%208-purple)
![MySQL](https://img.shields.io/badge/Database-MySQL-blue)
![PWA](https://img.shields.io/badge/PWA-Supported-green)

</div>

---

## 📌 Giới thiệu

**Room Rental Management System (RRMS)** là hệ thống quản lý nhà trọ và cho thuê phòng trực tuyến toàn diện, hỗ trợ tối ưu hóa quy trình làm việc giữa chủ trọ (Landlord) và khách thuê (Tenant). 

Hệ thống giải quyết triệt để các vấn đề phức tạp trong việc quản lý cơ sở lưu trú như: quản lý thông tin phòng trống, quản lý hợp đồng thuê và danh sách người ở, ghi nhận chỉ số điện nước hàng tháng, tự động tính toán hóa đơn dịch vụ, ghi nhận lịch sử thanh toán, quản lý tệp tin hợp đồng pháp lý và tiếp nhận/xử lý yêu cầu sửa chữa cơ sở vật chất từ khách thuê.

Dự án được tổ chức theo kiến trúc phân tách rõ ràng giữa **Backend (REST API)** và **Frontend (React SPA)**:
- Backend đóng vai trò cung cấp REST API, xử lý nghiệp vụ, bảo mật và lưu trữ cơ sở dữ liệu.
- Frontend cung cấp giao diện tương tác động và trực quan, hỗ trợ cài đặt dạng Progressive Web App (PWA) trên thiết bị di động/desktop.

---

## 🎯 Mục tiêu dự án

- Số hóa và đơn giản hóa quy trình quản lý nhà trọ truyền thống.
- Cung cấp giải pháp tính toán tiền điện, nước và dịch vụ tự động, chính xác, minh bạch.
- Tăng cường khả năng giao tiếp và phản hồi thông tin giữa chủ trọ và khách thuê thông qua hệ thống báo lỗi cơ sở vật chất trực tuyến.
- Quản lý tập trung thông tin hợp đồng thuê phòng, lịch sử thanh toán và tài liệu số (file hợp đồng, ảnh hóa đơn chuyển khoản).
- Phân quyền rõ ràng và bảo mật tuyệt đối dữ liệu người dùng bằng JWT và Spring Security.

---

## ✨ Chức năng chính

### 👤 Người dùng & Phân quyền

Hệ thống hỗ trợ 2 vai trò chính với các quyền truy cập khác nhau:

#### 🤵 Chủ trọ (LANDLORD)
- **Quản lý phòng trọ**: Thêm mới, cập nhật thông tin phòng (tầng, diện tích, giá thuê gốc, tiền cọc mặc định, trạng thái phòng).
- **Quản lý khách thuê**: Quản lý hồ sơ khách thuê đại diện (CCCD/CMND, số điện thoại, ngày sinh, địa chỉ, thông tin liên hệ khẩn cấp).
- **Quản lý hợp đồng**: Lập hợp đồng mới, cập nhật tiền cọc thực tế, quản lý danh sách thành viên ở chung phòng, gia hạn hoặc chấm dứt hợp đồng.
- **Quản lý file hợp đồng**: Upload file ảnh/PDF tài liệu hợp đồng ký kết thực tế, lưu trữ tập trung.
- **Cấu hình đơn giá dịch vụ**: Cấu hình giá điện, nước, internet, rác, phí gửi xe... áp dụng riêng cho từng phòng theo từng mốc thời gian.
- **Ghi chỉ số điện nước**: Nhập chỉ số điện nước cũ/mới hàng tháng, tự động tính toán mức tiêu thụ.
- **Quản lý hóa đơn & Thanh toán**: Tự động tạo hóa đơn dựa trên số điện nước đã ghi và các phí dịch vụ khác. Duyệt các yêu cầu thanh toán chuyển khoản từ khách thuê, hoặc ghi nhận thanh toán bằng tiền mặt.
- **Xử lý yêu cầu bảo trì**: Tiếp nhận các yêu cầu sửa chữa cơ sở vật chất của khách thuê, cập nhật tiến độ (Chờ xử lý, Đang sửa, Đã hoàn thành) và cập nhật chi phí sửa chữa thực tế.
- **Xem báo cáo thống kê**: Dashboard tổng quan về doanh thu, số lượng phòng trống, số lượng khách thuê.

#### 🧑 Khách thuê (TENANT)
- **Đăng nhập hệ thống**: Truy cập tài khoản được chủ trọ cung cấp dựa trên số điện thoại.
- **Xem thông tin phòng & hợp đồng**: Xem chi tiết phòng mình đang thuê, danh sách thành viên ở cùng phòng, điều khoản hợp đồng và file hợp đồng đã ký.
- **Xem hóa đơn & Lịch sử thanh toán**: Xem chi tiết hóa đơn hàng tháng (tiền phòng + dịch vụ). Gửi yêu cầu xác nhận thanh toán kèm theo ảnh chụp biên lai chuyển khoản ngân hàng.
- **Gửi yêu cầu bảo trì**: Báo cáo sự cố cơ sở vật chất (như hỏng điện, rò rỉ nước, hỏng điều hòa...), chọn mức độ ưu tiên (Thấp, Trung bình, Cao) và theo dõi tiến độ xử lý của chủ trọ.
- **Quản lý thông tin cá nhân**: Cập nhật thông tin cá nhân hoặc mật khẩu tài khoản.

---

## 🏗️ Kiến trúc hệ thống

Hệ thống được thiết kế theo mô hình Client-Server phân tách:

```text
       [ Client / Browser (React SPA) ]
                      ↕  (REST API calls via Axios/Fetch with JWT)
       [ Backend Server (Spring Boot REST API) ]
                      ↓
 [ Controller -> Service -> Repository -> JPA Entities ]
                      ↓
            [ MySQL Database ]
```

- **Frontend**: Hoạt động như một ứng dụng đơn trang (SPA - Single Page Application), lưu trữ cấu hình proxy nội bộ để chuyển tiếp các request `/api` về cổng Backend. Tích hợp công nghệ PWA giúp người dùng cài đặt ứng dụng về màn hình chính của thiết bị di động/máy tính để sử dụng.
- **Backend**: Cung cấp các API RESTful bảo mật và phi trạng thái (Stateless API), tương tác với database thông qua Spring Data JPA và Hibernate.

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 4.x
- **Data Access:** Spring Data JPA (Hibernate)
- **Security:** Spring Security & Java JWT (JJWT)
- **API Testing:** Postman
- **Build tool:** Maven
- **Khác:** Lombok, Spring Boot Starter Validation

### Frontend
- **Ngôn ngữ & Thư viện:** HTML5, CSS3, JavaScript, React 19
- **Build Tool:** Vite 8
- **Routing:** React Router DOM 7
- **PWA:** `vite-plugin-pwa` (Hỗ trợ cache dữ liệu ngoại tuyến, cài đặt ứng dụng)
- **Icons:** Lucide React
- **Styling:** Custom CSS cho giao diện hiện đại, trực quan.

### Database
- **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ.

---

## 🗄️ Cơ sở dữ liệu

Các bảng chính và các Class JPA Entities tương ứng trong hệ thống:

| Tên Bảng | Thực Thể (Entity) | Mô tả |
|---|---|---|
| `users` | [User](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/User.java) | Thông tin tài khoản đăng nhập và vai trò (`LANDLORD`, `TENANT`) |
| `rooms` | [Room](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/Room.java) | Danh sách phòng trọ, trạng thái (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`) |
| `tenants` | [Tenant](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/Tenant.java) | Hồ sơ cá nhân của khách thuê phòng đại diện |
| `room_rentals` | [RoomRental](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/RoomRental.java) | Hợp đồng thuê phòng, thông tin tiền cọc và thời hạn |
| `rental_members` | [RentalMember](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/RentalMember.java) | Danh sách người ở chung phòng trọ và vai trò (`REPRESENTATIVE`, `OCCUPANT`) |
| `contract_files` | [ContractFile](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/ContractFile.java) | File tài liệu đính kèm hợp đồng (định dạng JPG, PNG, PDF) |
| `rental_utility_rates` | [RentalUtilityRate](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/RentalUtilityRate.java) | Biểu giá dịch vụ tiện ích (điện, nước, internet, rác, gửi xe) áp dụng riêng từng phòng |
| `meter_readings` | [MeterReading](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/MeterReading.java) | Ghi nhận chỉ số điện/nước hàng tháng của từng phòng |
| `invoices` | [Invoice](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/Invoice.java) | Hóa đơn chi tiết hàng tháng và trạng thái (`UNPAID`, `PAID`, `OVERDUE`, `PENDING_APPROVAL`) |
| `payments` | [Payment](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/Payment.java) | Biên nhận giao dịch thanh toán hóa đơn (các phương thức: `CASH`, `BANK_TRANSFER`, `MOMO`, `ZALOPAY`...) |
| `maintenance_requests` | [MaintenanceRequest](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/java/com/thachbao/room_rental_management/entity/MaintenanceRequest.java) | Yêu cầu báo lỗi, sửa chữa cơ sở vật chất từ khách thuê |

---

## 📁 Cấu trúc thư mục

```text
room-rental-management
├── frontend/
│   ├── public/              # Tài nguyên tĩnh của React
│   ├── src/
│   │   ├── api/             # Cấu hình gọi API (Axios/Fetch)
│   │   ├── assets/          # Logo, hình ảnh dùng trong giao diện
│   │   ├── components/      # Các component tái sử dụng (Layout, Sidebar, Modal, v.v.)
│   │   ├── constants/       # Định nghĩa hằng số, API endpoint
│   │   ├── pages/           # Các trang chức năng (auth, rooms, tenants, invoices, v.v.)
│   │   ├── routes/          # Cấu hình định tuyến Route của React
│   │   ├── styles/          # File CSS tùy chỉnh của hệ thống
│   │   ├── utils/           # Helper JavaScript hữu ích
│   │   ├── App.jsx          # Component gốc React
│   │   └── main.jsx         # Điểm khởi tạo ứng dụng React
│   ├── package.json         # Khai báo thư viện & kịch bản frontend
│   └── vite.config.js       # Cấu hình Vite, PWA và Proxy chuyển tiếp API
│
├── src/
│   ├── main/
│   │   ├── java/com/thachbao/room_rental_management/
│   │   │   ├── config/       # Cấu hình CORS, Security, cấu hình ứng dụng
│   │   │   ├── controller/   # Lớp Controller tiếp nhận các API RESTful
│   │   │   ├── dto/          # Các đối tượng Request & Response (DTO)
│   │   │   ├── entity/       # Lớp Entity đại diện cho các bảng dữ liệu
│   │   │   ├── enums/        # Các enum trạng thái và phân quyền hệ thống
│   │   │   ├── exception/    # Quản lý biệt lệ và Global Exception Handler
│   │   │   ├── mapper/       # Chuyển đổi dữ liệu Entity ↔ DTO
│   │   │   ├── repository/   # Lớp Repository truy vấn cơ sở dữ liệu
│   │   │   ├── security/     # Lớp cấu hình Spring Security, JWT Filters
│   │   │   ├── service/      # Chứa Logic nghiệp vụ của hệ thống (Interface/Impl)
│   │   │   ├── util/         # Các helper utils cho Java
│   │   │   └── RoomRentalManagementApplication.java # Lớp khởi chạy ứng dụng
│   │   │
│   │   └── resources/
│   │       ├── db/           # File SQL lưu trữ cấu trúc database
│   │       └── application.properties # File cấu hình kết nối và biến môi trường
│   └── test/                 # Thư mục chứa các test case cho JUnit
│
├── pom.xml                   # Quản lý thư viện Maven
├── mvnw                      # Script khởi động Maven trên Unix
├── mvnw.cmd                  # Script khởi động Maven trên Windows
└── README.md                 # Tài liệu hướng dẫn dự án
```

---

## 🔐 Bảo mật hệ thống

Ứng dụng sử dụng cơ chế bảo mật nghiêm ngặt thông qua **Spring Security** kết hợp với token **JWT (JSON Web Token)**:

- **Mã hóa mật khẩu:** Mật khẩu người dùng được băm bằng thuật toán **BCrypt** trước khi lưu trữ vào cơ sở dữ liệu.
- **Xác thực phi trạng thái (Stateless):** Client gửi token JWT qua HTTP Header `Authorization: Bearer <token>` mỗi khi gọi API.
- **Phân quyền Route:** 
  - Các endpoint quản trị (`/api/rooms/**`, `/api/tenants/**`, `/api/invoices/**`, v.v.) chỉ cho phép vai trò `LANDLORD` truy cập.
  - Các endpoint gửi sự cố hoặc xem hóa đơn của phòng riêng (`/api/maintenance-requests/tenant/**`, v.v.) dành cho vai trò `TENANT`.
- **JWT Filters:** Tự động lọc và giải mã token để thiết lập SecurityContext cho mỗi yêu cầu.

---

## ⚙️ Cấu hình môi trường

Tệp cấu hình chính của Spring Boot là [application.properties](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/resources/application.properties). Tệp này sử dụng các biến môi trường để bảo mật thông tin kết nối. 

Để chạy dự án ở môi trường phát triển (Local), bạn cần thiết lập các biến môi trường sau trên hệ thống của mình hoặc thay thế trực tiếp vào tệp cấu hình (lưu ý không commit file chứa mật khẩu thật lên Git):

| Tên Biến Môi Trường | Mô Tả | Ví dụ cấu hình |
|---|---|---|
| `DB_URL` | Đường dẫn kết nối CSDL MySQL | `jdbc:mysql://localhost:3306/room_rental_management?useUnicode=true&characterEncoding=UTF-8` |
| `DB_USERNAME` | Tài khoản MySQL | `root` |
| `DB_PASSWORD` | Mật khẩu MySQL | `your_mysql_password` |
| `PORT` | Cổng chạy server Backend | `8080` |
| `ROOT_PHONE` | Số điện thoại Landlord mặc định | `0779637353` |
| `JWT_SECRET` | Khóa bí mật dùng để ký token JWT | `2b7e151628aed2a6abf7158809cf4f3c2b7e151628aed2a6abf71588...` (Chuỗi Base64 dài) |
| `JWT_EXPIRATION` | Thời hạn của token JWT (mili-giây) | `86400000` (24 giờ) |

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

### 1. Khởi tạo Cơ sở dữ liệu
- Khởi động máy chủ MySQL (mặc định tại cổng `3306`).
- Chạy tệp SQL [room_rental_db.sql](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room_rental_db.sql) để khởi tạo cấu trúc cơ sở dữ liệu `room_rental_management` và nạp dữ liệu chạy thử ban đầu.

### 2. Thiết lập cấu hình Backend
Sửa các biến môi trường tương ứng hoặc chỉnh sửa trực tiếp tệp [application.properties](file:///C:/Zalo%20Received%20Files/Du_an_ca_nhan/Room_Rental_Management/room-rental-management/src/main/resources/application.properties) theo kết nối MySQL cục bộ của bạn.

### 3. Khởi chạy máy chủ Backend (Spring Boot)
Mở cửa sổ Terminal tại thư mục gốc của dự án và chạy:
```bash
mvn spring-boot:run
```
*(Hoặc dùng `./mvnw spring-boot:run` trên Linux/macOS, hoặc `mvnw.cmd spring-boot:run` trên Windows).*

Backend REST API sẽ chạy thành công tại địa chỉ: **`http://localhost:8080`**

### 4. Cài đặt và khởi chạy máy chủ Frontend (React + Vite)
- Mở một cửa sổ Terminal thứ hai tại thư mục gốc của dự án.
- Di chuyển vào thư mục frontend:
  ```bash
  cd frontend
  ```
- Cài đặt các thư viện cần thiết:
  ```bash
  npm install
  ```
- Khởi động máy chủ phát triển Vite:
  ```bash
  npm run dev
  ```

Frontend sẽ chạy thành công tại địa chỉ: **`http://localhost:5173`**

---

## 🌐 Một số trang giao diện chính

Hệ thống được thiết kế tối ưu, trực quan với các trang giao diện tương ứng với nghiệp vụ chính:

| Trang giao diện | Đối tượng sử dụng | Chức năng |
|---|---|---|
| **Đăng nhập / Đăng ký** | Tất cả người dùng | Xác thực thông tin, phân quyền truy cập sau khi lấy token JWT |
| **Dashboard Tổng quan** | Chủ trọ & Khách trọ | Hiển thị các chỉ số nhanh (số phòng trống, hóa đơn quá hạn, doanh thu tháng) |
| **Quản lý phòng trọ** | Chủ trọ | Danh sách các phòng, cập nhật trạng thái trống/đã thuê/bảo trì |
| **Hợp đồng cho thuê** | Chủ trọ | Tạo hợp đồng thuê phòng, thiết lập tiền cọc, ngày bắt đầu và kết thúc |
| **Thành viên phòng trọ** | Chủ trọ & Khách trọ | Theo dõi và quản lý những người đang cùng lưu trú trong một phòng trọ |
| **Cấu hình Đơn giá dịch vụ**| Chủ trọ | Điều chỉnh đơn giá dịch vụ điện, nước, internet, rác... cho từng phòng cụ thể |
| **Ghi số điện nước** | Chủ trọ | Nhập chỉ số cũ và mới mỗi tháng của từng phòng để chuẩn bị lập hóa đơn |
| **Hóa đơn & Thanh toán** | Chủ trọ & Khách trọ | Quản lý hóa đơn dịch vụ hàng tháng. Xem chi tiết tiền phòng và tiện ích đã dùng |
| **Gửi/Xử lý yêu cầu bảo trì**| Chủ trọ & Khách trọ | Khách trọ gửi mô tả sự cố thiết bị; Chủ trọ cập nhật tiến trình và ghi nhận phí sửa |

---

## 🧪 Kiểm thử (Testing)

Bạn có thể chạy các bài kiểm thử tự động của hệ thống (bao gồm các test case cho JPA, Security, và Web MVC) bằng lệnh:

```bash
mvn test
```
Hoặc dùng Maven Wrapper:
```bash
./mvnw test
```

---

## 📌 Ghi chú khi deploy (triển khai thực tế)

Trước khi cấu hình đưa ứng dụng lên các nền tảng máy chủ VPS thực tế, hãy đảm bảo:

1. **Thay đổi `JWT_SECRET`**: Đảm bảo sử dụng một chuỗi bí mật ngẫu nhiên, có độ dài tối thiểu 256-bit và bảo mật tuyệt đối.
2. **Quyền ghi thư mục upload**: Kiểm tra và thiết lập quyền ghi (Write Permission) cho thư mục chứa các tệp tải lên (như ảnh biên lai hoặc PDF hợp đồng).
3. **Cấu hình HTTPS**: Khi chạy thực tế, ứng dụng PWA yêu cầu kết nối an toàn HTTPS để có thể hoạt động ổn định và cho phép cài đặt lên thiết bị của người dùng.
4. **Không công khai file bảo mật**: Tránh việc push tệp `.env` hoặc file `application.properties` chứa tài khoản DB thật lên các kho lưu trữ công cộng.

---

## 👨‍💻 Tác giả

| Họ tên | Vai trò |
|---|---|
| **ThachBao** | Developer chính |

---

## 🔮 Hướng phát triển

- Tích hợp cổng thanh toán trực tuyến (VNPAY, MoMo) để tự động thanh toán hóa đơn.
- Gửi thông báo tự động (qua email, Zalo ZNS hoặc Telegram) cho khách thuê khi đến kỳ đóng tiền hoặc khi chủ trọ cập nhật trạng thái sửa chữa.
- Tích hợp thêm biểu đồ doanh thu và báo cáo phân tích tài chính chi tiết hơn cho chủ trọ.
- Xây dựng thêm giao diện Mobile App native hoặc tối ưu hóa PWA sâu hơn để hỗ trợ thông báo đẩy (Push Notifications).
- Sử dụng Docker để container hóa toàn bộ hệ thống giúp triển khai nhanh chóng.

---

## 📜 Giấy phép

Dự án được phát triển phục vụ mục đích học tập, nghiên cứu và thực hành xây dựng hệ thống quản lý bất động sản/nhà trọ chuyên nghiệp bằng Java Spring Boot và ReactJS.

---

<div align="center">

### ⭐ Room Rental Management System (RRMS)

</div>
