// src/main/java/com/nangnaidee/backend/model/User.java
package com.nangnaidee.backend.model;


import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @Column(nullable = false, unique = true, length = 255)
    private String email;


    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;


    @Column(name = "full_name", length = 255)
    private String fullName;


    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();


    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}