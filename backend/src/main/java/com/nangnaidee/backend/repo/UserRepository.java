// repo/UserRepository.java
package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
}