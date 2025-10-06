// src/main/java/com/nangnaidee/backend/repo/PaymentRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByBookingId(UUID bookingId);

    boolean existsByBookingId(UUID bookingId);

    Page<Payment> findByStatus(String status, Pageable pageable);
}
