// src/main/java/com/nangnaidee/backend/repo/UserRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    /**
     * Admin User Management - ค้นหา users ด้วย filters ต่างๆ
     */
    
    // Base query - ทุก users
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Filter by full name or email (search)
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrderByCreatedAtDesc(
            String fullName, String email, Pageable pageable);
    
    // Filter by active status
    Page<User> findByIsActiveOrderByCreatedAtDesc(boolean isActive, Pageable pageable);
    
    // Filter by search + active status
    Page<User> findByIsActiveAndFullNameContainingIgnoreCaseOrIsActiveAndEmailContainingIgnoreCaseOrderByCreatedAtDesc(
            boolean isActive1, String fullName, boolean isActive2, String email, Pageable pageable);

    // Custom query สำหรับ filter by role
    @Query("SELECT u FROM User u JOIN u.roles r WHERE UPPER(r.code) = UPPER(:roleCode) ORDER BY u.createdAt DESC")
    Page<User> findByRoleCode(String roleCode, Pageable pageable);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE (UPPER(u.fullName) LIKE UPPER(CONCAT('%', :search, '%')) OR UPPER(u.email) LIKE UPPER(CONCAT('%', :search, '%'))) AND UPPER(r.code) = UPPER(:roleCode) ORDER BY u.createdAt DESC")
    Page<User> findByRoleCodeAndSearch(String roleCode, String search, Pageable pageable);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE u.isActive = :isActive AND UPPER(r.code) = UPPER(:roleCode) ORDER BY u.createdAt DESC")
    Page<User> findByRoleCodeAndIsActive(String roleCode, boolean isActive, Pageable pageable);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE u.isActive = :isActive AND (UPPER(u.fullName) LIKE UPPER(CONCAT('%', :search, '%')) OR UPPER(u.email) LIKE UPPER(CONCAT('%', :search, '%'))) AND UPPER(r.code) = UPPER(:roleCode) ORDER BY u.createdAt DESC")
    Page<User> findByRoleCodeAndIsActiveAndSearch(String roleCode, boolean isActive, String search, Pageable pageable);

    /**
     * Usage Report Queries
     */
    
    // Count active users in date range
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true AND u.createdAt <= :toDate")
    long countActiveUsersUpTo(@Param("toDate") java.time.LocalDateTime toDate);
    
    // Count new users in date range  
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :fromDate AND u.createdAt <= :toDate")
    long countNewUsersBetween(@Param("fromDate") java.time.LocalDateTime fromDate, @Param("toDate") java.time.LocalDateTime toDate);
    
    // Count new hosts in date range
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE UPPER(r.code) = 'HOST' AND u.createdAt >= :fromDate AND u.createdAt <= :toDate")
    long countNewHostsBetween(@Param("fromDate") java.time.LocalDateTime fromDate, @Param("toDate") java.time.LocalDateTime toDate);
}