package com.thachbao.room_rental_management.entity;

import com.thachbao.room_rental_management.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "invoices", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"rental_id", "billing_month"})
})
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id", nullable = false)
    private RoomRental rental;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_tenant_id", nullable = false)
    private Tenant representativeTenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meter_reading_id", nullable = false)
    private MeterReading meterReading;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utility_rate_id", nullable = false)
    private RentalUtilityRate utilityRate;

    @Column(name = "billing_month", nullable = false, length = 7)
    private String billingMonth;

    @Column(name = "rent_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal rentAmount;

    @Column(name = "electric_usage", nullable = false)
    private Integer electricUsage;

    @Column(name = "electric_unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal electricUnitPrice;

    @Column(name = "electric_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal electricAmount;

    @Column(name = "water_usage", nullable = false)
    private Integer waterUsage;

    @Column(name = "water_unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal waterUnitPrice;

    @Column(name = "water_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal waterAmount;

    @Column(name = "internet_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal internetFee;

    @Column(name = "trash_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal trashFee;

    @Column(name = "parking_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal parkingFee;

    @Column(name = "other_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal otherFee;

    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private InvoiceStatus status;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "receipt_image_url", length = 500)
    private String receiptImageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
