// src/main/java/com/nangnaidee/backend/model/Role.java
package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;


import java.util.HashSet;
import java.util.Set;


@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@Entity @Table(name = "roles")
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    @EqualsAndHashCode.Include
    @ToString.Include
    private String code;

    @Column(nullable = false, length = 100)
    @ToString.Include
    private String name;

    @ManyToMany(mappedBy = "roles")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<User> users = new HashSet<>();
}