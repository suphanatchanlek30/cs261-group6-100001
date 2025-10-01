package com.nangnaidee.backend.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", ex.getClass().getSimpleName(),
                        "message", ex.getMessage()));
    }
}