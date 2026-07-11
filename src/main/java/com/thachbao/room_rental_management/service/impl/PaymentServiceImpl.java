package com.thachbao.room_rental_management.service.impl;

import com.thachbao.room_rental_management.dto.request.payment.PaymentRequest;
import com.thachbao.room_rental_management.dto.response.payment.PaymentResponse;
import com.thachbao.room_rental_management.entity.Invoice;
import com.thachbao.room_rental_management.entity.Payment;
import com.thachbao.room_rental_management.entity.User;
import com.thachbao.room_rental_management.enums.InvoiceStatus;
import com.thachbao.room_rental_management.exception.BadRequestException;
import com.thachbao.room_rental_management.exception.ResourceNotFoundException;
import com.thachbao.room_rental_management.mapper.PaymentMapper;
import com.thachbao.room_rental_management.repository.InvoiceRepository;
import com.thachbao.room_rental_management.repository.PaymentRepository;
import com.thachbao.room_rental_management.repository.UserRepository;
import com.thachbao.room_rental_management.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final com.thachbao.room_rental_management.repository.TenantRepository tenantRepository;
    private final com.thachbao.room_rental_management.repository.RentalMemberRepository rentalMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayments(Long invoiceId, Long receivedByUserId) {
        List<Payment> paymentsList;
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElse(null);
            if (tenant == null) {
                return List.of();
            }
            List<com.thachbao.room_rental_management.entity.RentalMember> memberships = rentalMemberRepository.findByTenant_Id(tenant.getId());
            List<Long> rentalIds = memberships.stream()
                    .map(m -> m.getRental().getId())
                    .collect(Collectors.toList());

            paymentsList = new ArrayList<>();
            if (!rentalIds.isEmpty()) {
                paymentsList = paymentRepository.findByInvoice_Rental_IdIn(rentalIds);
            }
            if (invoiceId != null) {
                paymentsList = paymentsList.stream()
                        .filter(p -> p.getInvoice() != null && p.getInvoice().getId().equals(invoiceId))
                        .collect(Collectors.toList());
            }
        } else {
            if (invoiceId != null && receivedByUserId != null) {
                paymentsList = new java.util.ArrayList<>();
                java.util.Optional<Payment> opt = paymentRepository.findByInvoice_Id(invoiceId);
                if (opt.isPresent()) {
                    Payment p = opt.get();
                    if (p.getReceivedByUser() != null && p.getReceivedByUser().getId().equals(receivedByUserId)) {
                        paymentsList.add(p);
                    }
                }
            } else if (invoiceId != null) {
                paymentsList = new java.util.ArrayList<>();
                java.util.Optional<Payment> opt = paymentRepository.findByInvoice_Id(invoiceId);
                if (opt.isPresent()) {
                    paymentsList.add(opt.get());
                }
            } else if (receivedByUserId != null) {
                paymentsList = paymentRepository.findByReceivedByUser_Id(receivedByUserId);
            } else {
                paymentsList = paymentRepository.findAll();
            }
        }
        return paymentsList.stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu thanh toán có id = " + id));
        if (com.thachbao.room_rental_management.security.SecurityUtils.hasRole("ROLE_TENANT")) {
            String phone = com.thachbao.room_rental_management.security.SecurityUtils.getCurrentUserPhone()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin đăng nhập"));
            com.thachbao.room_rental_management.entity.Tenant tenant = tenantRepository.findByUser_Phone(phone)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người thuê"));
            boolean isMember = rentalMemberRepository.existsByRental_IdAndTenant_Id(payment.getInvoice().getRental().getId(), tenant.getId());
            if (!isMember) {
                throw new BadRequestException("Bạn không có quyền truy cập thông tin thanh toán này");
            }
        }
        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn có id = " + request.getInvoiceId()));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Hóa đơn này đã được thanh toán");
        }

        if (paymentRepository.existsByInvoice_Id(request.getInvoiceId())) {
            throw new BadRequestException("Hóa đơn này đã tồn tại phiếu thanh toán");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Số tiền thanh toán phải lớn hơn 0");
        }

        if (request.getAmount().compareTo(invoice.getTotalAmount()) != 0) {
            throw new BadRequestException("Số tiền thanh toán phải bằng đúng tổng tiền hóa đơn: " + invoice.getTotalAmount());
        }

        User user = userRepository.findById(request.getReceivedByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người nhận tiền có id = " + request.getReceivedByUserId()));

        Payment payment = paymentMapper.toEntity(request);
        payment.setInvoice(invoice);
        payment.setReceivedByUser(user);

        Payment savedPayment = paymentRepository.save(payment);

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(request.getPaymentDate());
        invoiceRepository.save(invoice);

        return paymentMapper.toResponse(savedPayment);
    }
}
