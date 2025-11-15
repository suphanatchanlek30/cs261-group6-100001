// src/main/java/com/nangnaidee/backend/repo/RoleRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByCode(String code);

    boolean existsByCode(String code);
}



