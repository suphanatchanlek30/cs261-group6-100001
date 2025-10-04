// src/main/java/com/nangnaidee/backend/dto/RegisterRequest.java
package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class RegisterRequest {
    @NotBlank(message = "กรุณากรอกอีเมล")
    @Email(message = "รูปแบบอีเมลไม่ถูกต้อง")
    private String email;


    @NotBlank(message = "กรุณากรอกรหัสผ่าน")
    private String password;


    @NotBlank(message = "กรุณากรอกชื่อเต็ม")
    private String fullName;


    @NotBlank(message = "กรุณาระบุบทบาท USER หรือ HOST")
    private String role;
}
