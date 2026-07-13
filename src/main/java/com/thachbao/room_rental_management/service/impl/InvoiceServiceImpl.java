package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.invoice.InvoiceGenerateRequest;
import com.thachbao.room_rental_management.dto.request.invoice.InvoiceUpdateRequest;
import com.thachbao.room_rental_management.dto.response.invoice.InvoiceResponse;
import com.thachbao.room_rental_management.entity.*;
import com.thachbao.room_rental_management.enums.InvoiceStatus;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.InvoiceMapper;
import com.thachbao.room_rental_management.repository.InvoiceRepository;
import com.thachbao.room_rental_management.repository.MeterReadingRepository;
import com.thachbao.room_rental_management.repository.RoomRentalRepository;
import com.thachbao.room_rental_management.service.InvoiceService;
import com.thachbao.room_rental_management.service.RentalUtilityRateService;
import com.thachbao.room_rental_management.repository.PaymentRepository;
import com.thachbao.room_rental_management.repository.UserRepository;
import com.thachbao.room_rental_management.security.SecurityUtils;
import com.thachbao.room_rental_management.enums.PaymentMethod;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final RoomRentalRepository roomRentalRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final RentalUtilityRateService rentalUtilityRateService;
    private final InvoiceMapper invoiceMapper;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final com.thachbao.room_rental_management.repository.TenantRepository tenantRepository;
    private final com.thachbao.room_rental_management.repository.RentalMemberRepository rentalMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoices(InvoiceStatus status, Long rentalId, Long roomId, String billingMonth) {
        List<Invoice> invoices;
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElse(null);
            if (tenant == null) {
                return List.of();
            }
            List<RentalMember> memberships = rentalMemberRepository.findByTenant_Id(tenant.getId());
            List<Long> rentalIds = memberships.stream()
                    .map(m -> m.getRental().getId())
                    .collect(Collectors.toList());

            if (rentalIds.isEmpty()) {
                return List.of();
            }

            if (rentalId != null) {
                if (!rentalIds.contains(rentalId)) {
                    throw new BadRequestException("Bạn không có quyền xem hóa đơn của lượt thuê này");
                }
                invoices = invoiceRepository.searchInvoicesForTenant(List.of(rentalId), status, roomId, billingMonth);
            } else {
                invoices = invoiceRepository.searchInvoicesForTenant(rentalIds, status, roomId, billingMonth);
            }
        } else {
            invoices = invoiceRepository.searchInvoices(status, rentalId, roomId, billingMonth);
        }

        return invoices.stream()
                .map(invoiceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn có id = " + id));
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(invoice.getRental().getId(), tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập hóa đơn này");
            }
        }
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse generateInvoice(InvoiceGenerateRequest request) {
        RoomRental rental = roomRentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt thuê phòng có id = " + request.getRentalId()));

        if (invoiceRepository.existsByRental_IdAndBillingMonth(request.getRentalId(), request.getBillingMonth())) {
            throw new BadRequestException("Đã tồn tại hóa đơn cho lượt thuê này trong tháng " + request.getBillingMonth());
        }

        MeterReading meterReading = meterReadingRepository.findByRental_IdAndBillingMonth(request.getRentalId(), request.getBillingMonth())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy chỉ số điện nước cho lượt thuê này trong tháng " + request.getBillingMonth()));

        RentalUtilityRate utilityRate = rentalUtilityRateService.getAppliedUtilityRate(request.getRentalId(), request.getBillingMonth());

        Room room = rental.getRoom();
        Tenant representativeTenant = rental.getRepresentativeTenant();
        if (room == null || representativeTenant == null) {
            throw new BadRequestException("Thông tin lượt thuê không hợp lệ (thiếu phòng hoặc người đại diện)");
        }

        BigDecimal rentAmount = rental.getMonthlyRentPrice();
        Integer electricUsage = meterReading.getElectricUsage();
        BigDecimal electricUnitPrice = utilityRate.getElectricUnitPrice();
        BigDecimal electricAmount = electricUnitPrice.multiply(BigDecimal.valueOf(electricUsage));

        Integer waterUsage = meterReading.getWaterUsage();
        BigDecimal waterUnitPrice = utilityRate.getWaterUnitPrice();
        BigDecimal waterAmount = waterUnitPrice.multiply(BigDecimal.valueOf(waterUsage));

        BigDecimal internetFee = utilityRate.getInternetFee();
        BigDecimal trashFee = utilityRate.getTrashFee();
        BigDecimal parkingFee = utilityRate.getParkingFee();

        BigDecimal otherFee = request.getOtherFee() != null ? request.getOtherFee() : BigDecimal.ZERO;
        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;

        BigDecimal totalAmount = rentAmount
                .add(electricAmount)
                .add(waterAmount)
                .add(internetFee)
                .add(trashFee)
                .add(parkingFee)
                .add(otherFee)
                .subtract(discountAmount);

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Tổng số tiền hóa đơn không được phép âm");
        }

        Invoice invoice = invoiceMapper.toEntity(request);
        invoice.setRoom(room);
        invoice.setRental(rental);
        invoice.setRepresentativeTenant(representativeTenant);
        invoice.setMeterReading(meterReading);
        invoice.setUtilityRate(utilityRate);
        invoice.setRentAmount(rentAmount);
        invoice.setElectricUsage(electricUsage);
        invoice.setElectricUnitPrice(electricUnitPrice);
        invoice.setElectricAmount(electricAmount);
        invoice.setWaterUsage(waterUsage);
        invoice.setWaterUnitPrice(waterUnitPrice);
        invoice.setWaterAmount(waterAmount);
        invoice.setInternetFee(internetFee);
        invoice.setTrashFee(trashFee);
        invoice.setParkingFee(parkingFee);
        invoice.setOtherFee(otherFee);
        invoice.setDiscountAmount(discountAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(InvoiceStatus.UNPAID);

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponse(savedInvoice);
    }

    @Override
    @Transactional
    public InvoiceResponse updateInvoice(Long id, InvoiceUpdateRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn có id = " + id));

        if (invoice.getStatus() != InvoiceStatus.UNPAID) {
            throw new BadRequestException("Chỉ cho phép cập nhật hóa đơn khi trạng thái là UNPAID");
        }

        invoiceMapper.updateEntity(invoice, request);

        // Recalculate totalAmount
        BigDecimal totalAmount = invoice.getRentAmount()
                .add(invoice.getElectricAmount())
                .add(invoice.getWaterAmount())
                .add(invoice.getInternetFee())
                .add(invoice.getTrashFee())
                .add(invoice.getParkingFee())
                .add(invoice.getOtherFee())
                .subtract(invoice.getDiscountAmount());

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Tổng số tiền hóa đơn không được phép âm");
        }

        invoice.setTotalAmount(totalAmount);

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponse(updatedInvoice);
    }

    @Override
    @Transactional
    public InvoiceResponse markOverdue(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn có id = " + id));

        if (invoice.getStatus() == InvoiceStatus.UNPAID) {
            invoice.setStatus(InvoiceStatus.OVERDUE);
            Invoice updated = invoiceRepository.save(invoice);
            return invoiceMapper.toResponse(updated);
        } else {
            throw new BadRequestException("Chỉ có thể đánh dấu quá hạn cho hóa đơn đang có trạng thái UNPAID");
        }
    }

    @Override
    @Transactional
    public InvoiceResponse confirmPayment(Long id, String receiptImageUrl) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn có id = " + id));

        if (SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(invoice.getRental().getId(), tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền xác nhận thanh toán cho hóa đơn này");
            }
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Hóa đơn này đã được thanh toán rồi");
        }

        invoice.setStatus(InvoiceStatus.PENDING_APPROVAL);
        invoice.setReceiptImageUrl(receiptImageUrl);

        Invoice updated = invoiceRepository.save(invoice);
        return invoiceMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public InvoiceResponse approvePayment(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn có id = " + id));

        if (invoice.getStatus() != InvoiceStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Chỉ có thể duyệt các hóa đơn đang có trạng thái chờ duyệt (PENDING_APPROVAL)");
        }

        // 1. Update Invoice
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        Invoice updatedInvoice = invoiceRepository.save(invoice);

        // 2. Create Payment history record
        String landlordPhone = SecurityUtils.getCurrentUserPhone()
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin quản trị viên trong ngữ cảnh bảo mật"));
        User landlordUser = userRepository.findByPhone(landlordPhone)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quản trị viên có số điện thoại = " + landlordPhone));

        if (paymentRepository.existsByInvoice_Id(id)) {
            throw new BadRequestException("Hóa đơn này đã có phiếu thanh toán");
        }

        Payment payment = Payment.builder()
                .invoice(updatedInvoice)
                .amount(updatedInvoice.getTotalAmount())
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .paymentDate(updatedInvoice.getPaidAt())
                .receivedByUser(landlordUser)
                .note("Duyệt chuyển khoản qua hình ảnh xác nhận")
                .build();
        paymentRepository.save(payment);

        return invoiceMapper.toResponse(updatedInvoice);
    }
}
