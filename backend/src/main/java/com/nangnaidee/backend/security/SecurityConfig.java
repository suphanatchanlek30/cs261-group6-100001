package com.nangnaidee.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // ชั่วคราว อนุญาต /health ทั้งหมด เพื่อง่ายต่อการทดสอบ
        http.csrf(csrf -> csrf.disable());
        http.authorizeHttpRequests(reg -> reg
                .requestMatchers("/health/**").permitAll()
                .anyRequest().authenticated()
        );
        return http.build();
    }
}