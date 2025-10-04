// src/main/java/com/nangnaidee/backend/model/Role.java
package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;


import java.util.Set;


@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @Column(nullable = false, unique = true, length = 50)
    private String code;


    @Column(nullable = false, length = 100)
    private String name;


    @ManyToMany(mappedBy = "roles")
    private Set<User> users;
}
