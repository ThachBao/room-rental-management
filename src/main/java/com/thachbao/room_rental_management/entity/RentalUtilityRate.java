package com.thachbao.room_rental_management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "rental_utility_rates", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"rental_id", "effective_from_month"})
})
public class RentalUtilityRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id", nullable = false)
    private RoomRental rental;

    @Column(name = "electric_unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal electricUnitPrice;

    @Column(name = "water_unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal waterUnitPrice;

    @Column(name = "internet_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal internetFee;

    @Column(name = "trash_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal trashFee;

    @Column(name = "parking_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal parkingFee;

    @Column(name = "effective_from_month", nullable = false, length = 7)
    private String effectiveFromMonth;

    @Column(name = "effective_to_month", length = 7)
    private String effectiveToMonth;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
