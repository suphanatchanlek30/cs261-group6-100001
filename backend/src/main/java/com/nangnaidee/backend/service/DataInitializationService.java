// src/main/java/com/nangnaidee/backend/service/DataInitializationService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.repo.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service สำหรับสร้างข้อมูลเริ่มต้น
 * - สร้าง Roles เท่านั้น (ADMIN, HOST, USER)
 * - ไม่สร้าง Admin User ล่วงหน้า
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🚀 เริ่มการสร้างข้อมูลเริ่มต้น...");

        createRoles();

        log.info("✅ สร้าง Roles เสร็จสิ้น - ระบบพร้อมใช้งาน");
        log.info("📝 สมัครสมาชิกได้ที่: POST /api/auth/register");
        log.info("   - Role: USER, HOST, หรือ ADMIN");
    }

    /**
     * สร้าง Roles เริ่มต้น
     * เหมือนกับ SQL: INSERT INTO dbo.roles(code, name) ... WHERE NOT EXISTS
     */
    private void createRoles() {
        log.info("📋 กำลังตรวจสอบและสร้าง Roles...");

        // ADMIN Role
        createRoleIfNotExists("ADMIN", "Administrator");

        // HOST Role
        createRoleIfNotExists("HOST", "Host");

        // USER Role
        createRoleIfNotExists("USER", "End User");

        log.info("📋 Roles พร้อมใช้งาน: ADMIN, HOST, USER");
    }

    /**
     * สร้าง Role ถ้ายังไม่มี (เหมือน WHERE NOT EXISTS)
     */
    private void createRoleIfNotExists(String code, String name) {
        if (!roleRepository.existsByCode(code)) {
            Role role = new Role();
            role.setCode(code);
            role.setName(name);
            roleRepository.save(role);
            log.info("✅ สร้าง {} role สำเร็จ", code);
        } else {
            log.info("ℹ️ {} role มีอยู่แล้ว", code);
        }
    }
}