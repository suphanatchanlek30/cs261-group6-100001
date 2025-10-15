// src/main/java/com/nangnaidee/backend/exception/BadRequestException.java

package com.nangnaidee.backend.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
