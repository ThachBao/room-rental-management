package com.thachbao.room_rental_management.entity;

import com.thachbao.room_rental_management.enums.DepositStatus;
import com.thachbao.room_rental_management.enums.RentalStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.java.Log;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "room_rentals")
public class RoomRental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    /** Một phòng có thể có nhiều lượt thuê theo thời gian.*/
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    /** Người đại diện thuê phòng*/
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_tenant_id", nullable = false)
    private Tenant representativeTenant;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expected_end_date")
    private LocalDate expectedEndDate;

    @Column(name = "move_out_date")
    private LocalDate moveOutDate;

    @Column(name = "monthly_rent_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyRentPrice;

    @Column(name = "deposit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal depositAmount;

    @Builder.Default
    @Column(name = "deposit_paid_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal depositPaidAmount = BigDecimal.ZERO;

    @Column(name = "deposit_paid_at")
    private LocalDateTime depositPaidAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_status", nullable = false, length = 20)
    private DepositStatus depositStatus = DepositStatus.HELD;

    @Builder.Default
    @Column(name = "deposit_deduction_amount" , nullable = false)
    private BigDecimal depositDeductionAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "deposit_return_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal depositReturnAmount = BigDecimal.ZERO;

    @Column(name = "deposit_returned_at")
    private LocalDateTime depositReturnedAt;

    @Column(name = "deposit_note", columnDefinition = "TEXT")
    private String depositNote;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RentalStatus status = RentalStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
