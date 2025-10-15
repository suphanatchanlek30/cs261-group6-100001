// src/main/java/com/nangnaidee/backend/exception/UnauthorizedException.java

package com.nangnaidee.backend.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}