package com.thachbao.room_rental_management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "meter_readings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"rental_id", "billing_month"})
})
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id", nullable = false)
    private RoomRental rental;

    @Column(name = "billing_month", nullable = false, length = 7)
    private String billingMonth;

    @Column(name = "old_electric_number", nullable = false)
    private Integer oldElectricNumber;

    @Column(name = "new_electric_number", nullable = false)
    private Integer newElectricNumber;

    @Column(name = "electric_usage", nullable = false)
    private Integer electricUsage;

    @Column(name = "old_water_number", nullable = false)
    private Integer oldWaterNumber;

    @Column(name = "new_water_number", nullable = false)
    private Integer newWaterNumber;

    @Column(name = "water_usage", nullable = false)
    private Integer waterUsage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
