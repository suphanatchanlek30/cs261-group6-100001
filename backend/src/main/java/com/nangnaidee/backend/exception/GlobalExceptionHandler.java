// src/main/java/com/nangnaidee/backend/exception/GlobalExceptionHandler.java

package com.nangnaidee.backend.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import org.springframework.http.converter.HttpMessageNotReadableException;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.UUID;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<?> handleEmailExists(EmailAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(InvalidRoleException.class)
    public ResponseEntity<?> handleInvalidRole(InvalidRoleException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return ResponseEntity.internalServerError().body("เกิดข้อผิดพลาดในระบบ: " + ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<?> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    // (ออปชัน) จัดการ validation error สวยขึ้น
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getDefaultMessage())
                .orElse("ข้อมูลไม่ถูกต้อง");
        return ResponseEntity.badRequest().body(msg);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("ไม่ได้รับอนุญาต");
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<?> handleForbidden(ForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<?> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(UnprocessableEntityException.class)
    public ResponseEntity<?> handleUnprocessableEntity(UnprocessableEntityException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(ex.getMessage());
    }

    // ขาดพารามิเตอร์จำเป็น เช่น ?hours=, ?start=
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<?> handleMissingParam(MissingServletRequestParameterException ex) {
        String name = ex.getParameterName();
        String msg;
        if ("start".equals(name)) {
            msg = "ต้องระบุพารามิเตอร์ start (รูปแบบ ISO-8601 เช่น 2025-10-10T09:00:00)";
        } else if ("hours".equals(name)) {
            msg = "ต้องระบุพารามิเตอร์ hours (จำนวนชั่วโมง ≥ 1)";
        } else {
            msg = "ต้องระบุพารามิเตอร์ " + name;
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);
    }

    // ชนิดพารามิเตอร์ไม่ถูกต้อง เช่น start ไม่ใช่ LocalDateTime / hours ไม่ใช่ตัวเลข
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String name = ex.getName();
        String msg;
        if ("start".equals(name)) {
            msg = "รูปแบบ start ไม่ถูกต้อง (ต้องเป็น ISO-8601 เช่น 2025-10-10T09:00:00)";
        } else if ("hours".equals(name)) {
            msg = "hours ต้องเป็นจำนวนเต็ม เช่น 1, 2, 3";
        } else if ("near".equals(name)) {
            msg = "near ต้องเป็นตัวเลข (ละติจูด) เช่น 18.79";
        } else if ("radiusKm".equals(name)) {
            msg = "radiusKm ต้องเป็นตัวเลข เช่น 5";
        } else if ("page".equals(name) || "size".equals(name)) {
            msg = name + " ต้องเป็นจำนวนเต็ม";
        } else {
            msg = "พารามิเตอร์ " + name + " ไม่ถูกต้อง";
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);
    }

    // กรณี parse เวลาเองแล้วพลาด (กันไว้ เผื่อจุดอื่น ๆ)
    @ExceptionHandler(DateTimeParseException.class)
    public ResponseEntity<?> handleDateTimeParse(DateTimeParseException ex) {
        String msg = "รูปแบบเวลาไม่ถูกต้อง (ใช้ ISO-8601 เช่น 2025-10-10T09:00:00)";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);
    }

    // กรณีที่โค้ดโยน IllegalArgumentException (เช่น start ต้องเป็นชั่วโมงเต็ม/hours < 1)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String nice = "ข้อมูล JSON ไม่ถูกต้อง";
        Throwable cause = ex.getMostSpecificCause();

        if (cause instanceof InvalidFormatException ife) {
            Class<?> target = ife.getTargetType();
            if (target == UUID.class) {
                // ระบุตรง ๆ ว่าฟิลด์ UUID ไม่ถูกต้อง
                nice = "unitId ต้องเป็น UUID รูปแบบที่ถูกต้อง เช่น 123e4567-e89b-12d3-a456-426614174000";
            } else if (target == OffsetDateTime.class) {
                nice = "startTime ต้องเป็นรูปแบบ ISO-8601 เช่น 2025-10-10T13:00:00+07:00 หรือใช้ Z (UTC)";
            } else {
                // เผื่อ field อื่น ๆ
                nice = "รูปแบบข้อมูลไม่ถูกต้องสำหรับฟิลด์ชนิด " + target.getSimpleName();
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(nice);
    }

}